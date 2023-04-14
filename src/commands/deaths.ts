import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class Deaths implements ICommand {
    name = "deaths";
    brief = "Get top 10 players by deaths";
    briefArgs = ""
    help = "Get the leaderboard of the 10 top players, sorted by deaths amount.";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        type SortItem = {
            uuid: string,
            deaths: number,
        }

        let sortable: SortItem[] = [];
        for (let k in bot.userData) {
            sortable.push({
                uuid: k,
                deaths: bot.userData[k].deaths,
            })
        }

        sortable.sort((a, b) => b.deaths - a.deaths);

        let message = "&aTop 10 deaths leaderboard";

        for (let i = 0; i < Math.min(10, sortable.length); i++) {
            let player = bot.userData[sortable[i].uuid];
            let counter = player.deaths.toString();
            message += `\n&b${(i + 1).toString().padStart(2)}. &6${player.name}&7: &a${counter}`;
        }

        bot.tell(command.user, message);
    }
}