import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class Quiet implements ICommand {
    name = "quiet";
    brief = "Toggle bot messages";
    briefArgs = ""
    help = "Enable and disable messages from the bot. Quiet by default.";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        let userData = bot.getUser(command.user);

        userData.quietMode = !userData.quietMode;

        bot.saveUserData();

        if (userData.quietMode) {
            bot.tell(command.user, "&6Bot messages are now disabled!");
        } else {
            bot.tell(command.user, "&aBot messages are now enabled!");
        }
    }
}