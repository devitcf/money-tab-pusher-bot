import TelegramBot = require("node-telegram-bot-api");
import { incorrectUsageMsg, logErrorMessage } from "./helpers/command";
import { Command } from "./types/command";
import { ErrorType } from "./types/error";

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
bot.onText(/\/accesstoken(.*)/, (msg, match) => {
  if (!match?.[1]) {
    bot
      .sendMessage(msg.chat.id, incorrectUsageMsg(Command.UPDATE_ACCESS_TOKEN), {
        parse_mode: "Markdown",
      })
      .catch((e: ErrorType) => logErrorMessage(e));
    return;
  }

  const accessToken = match[1].replace(" ", "");
  tokenByUser[msg.chat.username!] = { ...tokenByUser[msg.chat.username!], accessToken };

  bot.sendMessage(msg.chat.id, "Access token saved.").catch((e) => logErrorMessage(e));
});

// Handle refreshToken command
bot.onText(/\/refreshtoken(.*)/, (msg, match) => {
  if (!match?.[1]) {
    bot
      .sendMessage(msg.chat.id, incorrectUsageMsg(Command.UPDATE_REFRESH_TOKEN), {
        parse_mode: "Markdown",
      })
      .catch((e: ErrorType) => logErrorMessage(e));
    return;
  }

  const refreshToken = match[1].replace(" ", "");
  tokenByUser[msg.chat.username!] = { ...tokenByUser[msg.chat.username!], refreshToken };

  bot.sendMessage(msg.chat.id, "Refresh token saved.").catch((e) => logErrorMessage(e));
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
