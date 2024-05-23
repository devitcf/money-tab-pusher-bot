import TelegramBot = require("node-telegram-bot-api");
import { Command } from "./types/command";
import { ErrorCode, ErrorType } from "./types/error";
import { incorrectUsageMsg } from "./helpers/command";

require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", { polling: true });

const tokenByUser: { [username: string]: { accessToken: string; refreshToken?: string } } = {};
const inlineKeyboard = [
  [
    {
      text: "Update access token",
      callback_data: Command.UPDATE_ACCESS_TOKEN,
    },
  ],
  [
    {
      text: "Update refresh token (optional)",
      callback_data: Command.UPDATE_REFRESH_TOKEN,
    },
  ],
  [
    {
      text: "Logout",
      callback_data: Command.LOGOUT,
    },
  ],
];

// Start command
bot.onText(/\/start/, async (msg, match) => {
  console.log(msg);
  const name = msg.chat.first_name;
  const username = msg.chat.username;

  if (!tokenByUser[msg.chat.username as string]) {
    const accessTokenPrompt = await bot.sendMessage(msg.chat.id, `Hi ${name}, please select your options.`, {
      reply_markup: {
        // force_reply: true,
        // input_field_placeholder: "/accesstoken",
        keyboard: inlineKeyboard,
        // inline_keyboard: inlineKeyboard,
      },
    });
  }
});

// Handle accessToken command
bot.onText(/\/accesstoken(.*)/, async (msg, match) => {
  if (!match?.[1]) {
    try {
      await bot.sendMessage(msg.chat.id, incorrectUsageMsg(Command.UPDATE_ACCESS_TOKEN), {
        parse_mode: "Markdown",
      });
    } catch (e: any) {
      switch ((e as ErrorType)?.code) {
        case ErrorCode.EFATAL:
          console.log(e);
          break;
        case ErrorCode.EPARSE:
          console.log(e.response.body);
          break;
        case ErrorCode.ETELEGRAM:
          console.log(e.response.body.description);
          break;
      }
    }
    return;
  }

  const accessToken = match[1].replace(" ", "");
  tokenByUser[msg.chat.username!] = { ...tokenByUser[msg.chat.username!], accessToken };

  console.log(tokenByUser);
  bot.sendMessage(msg.chat.id, "Access token saved.");
});

// Callback query
bot.on("callback_query", (query) => {
  const { message: { chat, message_id, text } = {} } = query;
  if (!chat) {
    return;
  }
  switch (query.data) {
    case Command.LOGOUT:
      bot.sendMessage(chat.id, "Logout");
      break;
    default:
  }
  bot.answerCallbackQuery({
    callback_query_id: query.id,
  });
});
