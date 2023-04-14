import Bot from "../bot";
import SwitchChat from "switchchat";

export default abstract class ICommand {
    bot: Bot;
    abstract name: string;
    briefArgs: string | undefined;
    brief: string | undefined;
    help: string | undefined;
    abstract callback: (bot: Bot, command: SwitchChat.ChatboxCommand) => void;

    protected constructor(bot: Bot) {
        this.bot = bot;
    }
}