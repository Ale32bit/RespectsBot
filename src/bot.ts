import SwitchChat, {Client, User} from "switchchat";
import ICommand from "./commands/ICommand";
import path from "path";
import fs from "fs";
import {UserData} from "./playerData";

export default class Bot {
    public client: Client;
    public trigger: RegExp = /^f$/i;
    public commandPrefixes: string[] = [
        "f",
        "respects"
    ]
    public commands: {
        [key: string]: ICommand
    } = {};

    public lastDeath: User | null = null;
    public usersPaid: string[] = [];

    public userData: {
        [key: string]: UserData
    } = {};

    public sc_api = "https://api.sc3.io/v3/";

    public dataPath = path.resolve("data");

    constructor(token: string) {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath);
        }

        let client = new Client(token);
        this.client = client;

        this.loadCommands();
        this.loadUserData();

        client.defaultName = "&6Respects";
        client.defaultFormattingMode = "format";

        client.on("ready", () => {
            console.log("Connected! Client owner: " + client.owner);
            this.updateDeaths();
        });

        client.on("command", (command) => {
            if (!this.commandPrefixes.includes(command.command.toLowerCase()))
                return;

            console.log(`${command.user.name}: \\${command.command} ${command.args.join(" ")}`);

            let cmdName = command.args.shift();

            if (!cmdName) {
                if (!this.commands["help"]) {
                    this.tell(command.user, "&7Help currently not available!");
                    return;
                }

                this.commands["help"].callback(this, command);
                return;
            }

            if (!this.commands[cmdName]) {
                this.tell(command.user, "&fCommand not found.\nRun &7\\f help&f for help.");
                return;
            }

            this.commands[cmdName].callback(this, command);
        });

        client.on("chat_ingame", (message) => {
            if (!this.trigger.test(message.rawText)) {
                return;
            }

            let payer = this.getUser(message.user);
            this.payRespect(payer, false);
        })

        client.on("chat_discord", (message) => {
            if (!this.trigger.test(message.rawText)) {
                return;
            }

            let payer = this.findUserFromDiscord(message.discordUser.id);
            if(!payer)
                return;
            this.payRespect(payer, true);
        });

        client.on("death", death => {
            this.lastDeath = death.user;
            this.usersPaid = [];
            let userData = this.getUser(death.user);

            userData.deaths++;

            console.log(death.text);

            this.saveUserData();
        })
    }

    public payRespect(payer: UserData, fromDiscord: boolean = false): void {
        if (!this.lastDeath) {
            this.quietTell(payer, "&7No one died so far...")
            return;
        }

        if (this.usersPaid.includes(payer.uuid)) {
            this.quietTell(payer, "&cYou already paid respects!");
            return;
        }

        if (payer.uuid == this.lastDeath.uuid) {
            this.quietTell(payer, "&cYou cannot respect yourself! >:(");
            return;
        }

        this.usersPaid.push(payer.uuid);

        let receiver = this.getUser(this.lastDeath);

        payer.respectsGiven++;
        receiver.respects++;

        this.saveUserData();

        this.quietTell(payer, `&7You paid respects to &a${receiver.name}&7!`);
        this.quietTell(receiver, `&a${payer.name}&7 paid you respect!`);
    }

    public tell(user: SwitchChat.User | UserData, message: string) {
        this.client.tell(user.name, message)
            .catch(console.error);
    }

    public quietTell(user: UserData, message: string) {
        if(user.quietMode)
            return;

        this.tell(user, message);
    }

    private loadCommands() {
        let cmds = require(path.resolve(__dirname, "commands", "index"));
        for (const cmd in cmds) {
            let command = new cmds[cmd](this) as ICommand;
            this.commands[command.name] = command;
            console.log(`Loaded command ${command.name}`);
        }
    }

    public loadUserData() {
        if (!fs.existsSync(path.resolve(this.dataPath, "userdata.json"))) {
            this.userData = {};
            return;
        }
        let rawData = fs.readFileSync(path.resolve(this.dataPath, "userdata.json"), "utf-8");
        this.userData = JSON.parse(rawData);
    }

    public saveUserData() {
        if (!this.userData)
            return;

        fs.writeFileSync(path.resolve(this.dataPath, "userdata.json"), JSON.stringify(this.userData));
    }

    public getUser(user: User): UserData {
        if (!this.userData[user.uuid]) {
            return this.newUser(user.uuid, user.name);
        }

        return this.userData[user.uuid];
    }

    public findUserFromDiscord(discordId: string): UserData | null {
        for(const [uuid, data] of Object.entries(this.userData))  {
            if(data.discordId === discordId)
                return data
        }
        return null;
    }

    public newUser(uuid: string, name?: string): UserData {
        this.userData[uuid] = {
            uuid: uuid,
            name: name ?? `[${uuid}]`,
            deaths: 0,
            respects: 0,
            respectsGiven: 0,
            customDisplay: undefined,
            discordId: undefined,
            quietMode: true,
        };

        return this.userData[uuid];
    }

    public searchUser(username: string): UserData | null {
        username = username.toLowerCase();

        let onlineUser = this.client.players.filter(player => player.name.toLowerCase().includes(username));
        if (onlineUser[0]) {
            return this.getUser(onlineUser[0]);
        }

        for (const uuid in this.userData) {
            const userData = this.userData[uuid];
            if (userData.name.toLowerCase() === username) {
                return userData;
            }
        }
        return null;
    }

    public async updateDeaths() {
        type DeathData = {
            uuid: string,
            name: string,
            count: number,
        }
        let res = await fetch(this.sc_api + "deaths");
        let deaths = await res.json() as DeathData[];
        for (let i = 0; i < deaths.length; i++) {
            let death = deaths[i];
            let user = this.userData[death.uuid];
            if (!user) {
                user = this.newUser(death.uuid, death.name);
            }

            user.deaths = death.count;
        }

        this.saveUserData();
    }

    connect() {
        this.client.connect();
    }
}