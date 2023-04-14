import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand, DiscordChatMessage, User} from "switchchat";

export default class Link implements ICommand {
    name = "link";
    brief = "Link your Discord account";
    briefArgs = ""
    help = "Link your Discord account and pay respects without being in-game";
    awaitingLinks: { [key: string]: User } = {};
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
        bot.client.on("chat_discord", this.onDiscordMessage.bind(this))
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        let code = this.generateRandomCode(command.user);
        bot.tell(command.user,
            `&6Send the following code in &a#server-chat&6:`
            + `\n\n&b${code}\n\n`
            + `&6to link your Discord account.`
        );
    }

    private onDiscordMessage(message: DiscordChatMessage): void {
        console.log(message);
        if (!message.rawText.match(/^F-[0-9]{6}$/i))
            return;

        let code = message.rawText.toUpperCase();
        if (!this.awaitingLinks[code])
            return;

        let user = this.awaitingLinks[code];
        let player = this.bot.getUser(user);
        player.discordId = message.discordUser.id;

        this.bot.saveUserData();
        this.bot.tell(user, `&9${message.discordUser.name}#${message.discordUser.discriminator} &ais now linked to your account!`);
    }

    private generateRandomCode(user: User): string {
        let code = "F-" + this.randomInt(0, 999999).toString().padStart(6, "0");
        this.awaitingLinks[code] = user;
        return code;
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}