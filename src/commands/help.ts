import ICommand from "./ICommand";
import Bot from "../bot";
import {ChatboxCommand} from "switchchat";
import {UserData} from "../playerData";

export default class Help implements ICommand {
    name = "help";
    brief = "Get help about commands";
    briefArgs = "[command]"
    help = "Get help about commands and how to use them.";
    bot: Bot;
    constructor(bot: Bot) {
        this.bot = bot;
    }

    callback(bot: Bot, command: ChatboxCommand): void {
        if(command.args.length > 0) {
            let cmdName = command.args[0];
            if(!bot.commands[cmdName]) {
                bot.tell(command.user, "&cCommand not found!");
                return;
            }

            let cmd = bot.commands[cmdName];
            let message = `&a${cmdName}`;
            if(cmd.briefArgs && cmd.briefArgs.length > 0) {
                message += ` &7${cmd.briefArgs}`;
            }

            message += `\n&6${cmd.help}`

            bot.tell(command.user, message);
            return;
        }

        let message = `&aHelp list:`;

        for (const name in bot.commands) {
            let cmd = bot.commands[name];
            message += `\n&a${name}`;
            if(cmd.briefArgs && cmd.briefArgs.length > 0) {
                message += ` &7${cmd.briefArgs}`;
            }
            message += `&6: ${cmd.brief ?? "&oNo brief description."}`;
        }

        if(bot.lastDeath) {
            message += `\n\n&6Last death by &a${bot.lastDeath.name} &6with &a${bot.usersPaid.length} &6respects for far.`;
        } else {
            message += `\n\n&6Last death by &7&oNo one&6.`;
        }

        bot.tell(command.user, message);
    }
}