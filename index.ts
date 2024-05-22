import TelegramBot = require("node-telegram-bot-api");
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg: TelegramBot.Message) => {
  const Hi = "hi";
  if (msg?.text?.toString().toLowerCase().indexOf(Hi) === 0) {
    await bot.sendMessage(msg.chat.id, "Hello dear user");
  }
});
