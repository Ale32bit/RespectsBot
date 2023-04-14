import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class Top implements ICommand {
    name = "top";
    brief = "Get top 10 players by respects";
    briefArgs = ""
    help = "Get the leaderboard of the 10 top players, sorted by respects amount.";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        type SortItem = {
            uuid: string,
            respects: number,
        }

        let sortable: SortItem[] = [];
        for (let k in bot.userData) {
            sortable.push({
                uuid: k,
                respects: bot.userData[k].respects,
            })
        }

        sortable.sort((a, b) => b.respects - a.respects);

        let message = "&aTop 10 leaderboard";

        for (let i = 0; i < Math.min(10, sortable.length); i++) {
            let player = bot.userData[sortable[i].uuid];
            let counter: string;
            if (player.customDisplay) {
                counter = player.customDisplay.replace(/{}/g, player.respects.toString());
            } else {
                counter = player.respects.toString();
            }
            message += `\n&b${(i + 1).toString().padStart(2)}. &6${player.name}&7: &a${counter}`;
        }

        bot.tell(command.user, message);
    }
}