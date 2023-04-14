import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class Counter implements ICommand {
    name = "counter";
    brief = "Set a custom counter";
    briefArgs = "[text]"
    help = "Set a custom counter to show in respects leaderboard.\n&aUse&7{} &aas counter placeholder. Leave empty to reset.";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }


    callback(bot: Bot, command: ChatboxCommand): void {
        let userData = bot.getUser(command.user);
        if (command.args.length === 0) {
            userData.customDisplay = undefined;
            bot.saveUserData();
            bot.tell(command.user, "&aYou cleared your custom counter!")
            return;
        }

        userData.customDisplay = command.args.join(" ");
        bot.saveUserData();
        let message = `&6Set custom counter message to &7"${userData.customDisplay}&7"&6!`;
        message += `\n&6Preview: &a${userData.customDisplay.replace(/{}/g, userData.respects.toString())}`;
        bot.tell(command.user, message);
    }
}