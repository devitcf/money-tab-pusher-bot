import TelegramBot = require("node-telegram-bot-api");
import { getCourse, getPaidVideo } from "./api";
import { incorrectUsageMsg, logErrorMessage } from "./helpers/command";
import wordings from "./helpers/wordings";
import { tokenSession } from "./session/tokenSession";
import { courseSession } from "./session/courseSession";
import { Command, ErrorType } from "./types";

require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", { polling: true });

// Start command
bot.onText(/\/start/, async (msg) => {
  const { first_name: name, username } = msg.chat;

  if (!tokenSession.tokenByUser[username!]) {
    bot.sendMessage(msg.chat.id, `Hi ${name}`).catch((e) => logErrorMessage(e));
    bot
      .sendMessage(
        msg.chat.id,
        "In order to use this bot, please provide your access token by the command `/accesstoken YOUR_ACCESS_TOKEN_HERE`",
        { parse_mode: "Markdown" }
      )
      .catch((e) => logErrorMessage(e));
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
      .sendMessage(msg.chat.id, wordings.MISSING_TOKEN_MSG, {
        parse_mode: "Markdown",
      })
      .catch((e: ErrorType) => logErrorMessage(e));
    return;
  }

  const res = await getCourse(msg.chat.username!);
  const courses = res.value;

  courseSession.updateCourseByUser(msg.chat.username!, courses);

  bot
    .sendMessage(msg.chat.id, wordings.SELECT_YOUR_COURSE, {
      reply_markup: {
        inline_keyboard: [
          courses.map((course) => ({
            text: course.title,
            callback_data: `${course.url_key}|${course.latest_topic_id}`,
          })),
        ],
      },
    })
    .catch((e: ErrorType) => logErrorMessage(e));
});

// Callback query
bot.on("callback_query", async (query) => {
  const { data, message } = query;
  if (!message || !data) {
    return;
  }
  const [urlKey, topicId] = data.split("|");
  const res = await getPaidVideo(message.chat.username!, topicId);
  if (!res.videos) {
    return;
  }

  let responseText = "";
  for (const video of res.videos) {
    responseText += `${video.title} \n\n ${video.youtube?.video_url}`;
  }

  bot
    .sendMessage(message.chat.id, responseText, {
      parse_mode: "Markdown",
      // reply_markup: {
      // inline_keyboard: inlineKeyboard,
      // },
    })
    .catch((e) => logErrorMessage(e));
});
