import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class View implements ICommand {
    name = "view";
    brief = "View information about you or a player";
    briefArgs = "[player]"
    help = "View information about you or a player";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        let userData: UserData;
        if (command.args.length > 0) {
            let data = bot.searchUser(command.args[0]);
            if (data === null) {
                bot.tell(command.user, `&cUser &7"${command.args[0]}"&c not found!`);
                return;
            }
            userData = data;
        } else {
            userData = bot.getUser(command.user);
        }

        let message = `&a${userData.name}&6's information:`;
        message += `\n&6Respects received: &a${userData.respects}`;
        message += `\n&6Respects paid: &a${userData.respectsGiven}`;
        message += `\n&6Deaths: &a${userData.deaths}`;
        message += `\n&6Custom: &a${userData.customDisplay ?? "&7&oNot set!"}`;

        bot.tell(command.user, message);
    }
}