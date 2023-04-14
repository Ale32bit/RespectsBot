import Bot from "./bot";

require('dotenv').config()

const bot = new Bot(process.env.SC_TOKEN as string);

bot.connect();