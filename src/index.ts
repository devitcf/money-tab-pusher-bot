import TelegramBot = require("node-telegram-bot-api");
import { getCourse } from "./api";
import { incorrectUsageMsg, logErrorMessage } from "./helpers/command";
import { tokenSession } from "./session/tokenSession";
import { Command, Course, CourseType, ErrorType } from "./types";

require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", { polling: true });

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
];

// Start command
bot.onText(/\/start/, async (msg, match) => {
  console.log(msg);
  const name = msg.chat.first_name;
  const username = msg.chat.username;

  if (!tokenSession.tokenByUser[msg.chat.username as string]) {
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
  tokenSession.updateAccessToken(msg.chat.username!, accessToken);

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

  tokenSession.updateRefreshToken(msg.chat.username!, refreshToken);

  bot.sendMessage(msg.chat.id, "Refresh token saved.").catch((e) => logErrorMessage(e));
});

// Handle refreshToken command
bot.onText(/\/course/, async (msg) => {
  const token = tokenSession.getToken(msg.chat.username);
  if (!token || !token?.accessToken) {
    bot
      .sendMessage(
        msg.chat.id,
        "Missing access token. Please add your access token using command `/accesstoken YOUR_ACCESS_TOKEN_HERE`",
        {
          parse_mode: "Markdown",
        }
      )
      .catch((e: ErrorType) => logErrorMessage(e));
    return;
  }

  let courses: Course[] = [];

  const coursesResponse = await getCourse(msg.chat.username!);
  courses = coursesResponse.value;

  const accessTokenPrompt = await bot.sendMessage(msg.chat.id, `Hi, please select your options.`, {
    reply_markup: {
      inline_keyboard: [
        courses.map((course) => ({
          text: course.title,
          callback_data: course.url_key,
        })),
      ],
    },
  });
  console.log(courses);
});

// Callback query
bot.on("callback_query", (query) => {
  const { message: { chat, message_id, text } = {} } = query;
  if (!chat) {
    return;
  }
  switch (query.data) {
    case CourseType["3PM_PREMIUM"]:
      bot.sendMessage(chat.id, "3PM_PREMIUM");
      break;
    case CourseType["9PM_PREMIUM"]:
      bot.sendMessage(chat.id, "9PM_PREMIUM");
      break;
    default:
  }
  bot.answerCallbackQuery({
    callback_query_id: query.id,
  });
});
