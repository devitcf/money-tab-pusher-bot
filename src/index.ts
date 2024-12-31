import { CronJob } from "cron";
import TelegramBot from "node-telegram-bot-api";
import { chatSession } from "./session/chatSession";
import { courseSession } from "./session/courseSession";
import { tokenSession } from "./session/tokenSession";
import { incorrectUsageMsg, logErrorMessage } from "./helpers/commands";
import { getVideosByUsername, updateCourseByUsername } from "./helpers/courses";
import { QueryType, Command } from "./types";

require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN ?? "", {
  polling: true,
  request: {
    agentOptions: {
      keepAlive: true,
      family: 4,
    },
    url: "https://api.telegram.org",
  },
});

const { updateChatIdByUser } = chatSession;

// Start command
bot.onText(/\/start/, async (msg) => {
  const { first_name: name, username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  if (!tokenSession.tokenByUser[username!]) {
    await bot.sendMessage(chatId, `Hi ${name}`).catch((e) => logErrorMessage(e));
    await bot
      .sendMessage(
        chatId,
        "In order to use this bot, please provide your access token by the command `/accesstoken YOUR_ACCESS_TOKEN_HERE`",
        { parse_mode: "Markdown" }
      )
      .catch((e) => logErrorMessage(e));
  }
});

// Handle /accessToken command
bot.onText(/\/accesstoken(.*)/, async (msg, match) => {
  const { username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  if (!match?.[1]) {
    await bot
      .sendMessage(chatId, incorrectUsageMsg(Command.UPDATE_ACCESS_TOKEN), {
        parse_mode: "Markdown",
      })
      .catch((e) => logErrorMessage(e));
    return;
  }

  const accessToken = match[1].replace(" ", "");
  await tokenSession.updateAccessToken(username!, accessToken);

  await bot.sendMessage(chatId, "Access token saved.").catch((e) => logErrorMessage(e));
});

// Handle /refreshToken command
bot.onText(/\/refreshtoken(.*)/, async (msg, match) => {
  const { username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  if (!match?.[1]) {
    await bot
      .sendMessage(chatId, incorrectUsageMsg(Command.UPDATE_REFRESH_TOKEN), {
        parse_mode: "Markdown",
      })
      .catch((e) => logErrorMessage(e));
    return;
  }

  const refreshToken = match[1].replace(" ", "");
  await tokenSession.updateRefreshToken(username!, refreshToken);

  await bot.sendMessage(chatId, "Refresh token saved.").catch((e) => logErrorMessage(e));
});

// Handle /course command
bot.onText(/\/course/, async (msg) => {
  const { username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  if (username) {
    await updateCourseByUsername(username, bot);
  }
});

// Handle /clear command
bot.onText(/\/clear/, async (msg) => {
  const { username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  if (username) {
    const courses = courseSession.coursesByUser[username];
    courses?.forEach((course) => {
      course.job?.stop();
      course.job = undefined;
    });
    await bot.sendMessage(chatId, "All pusher jobs cleared.").catch((e) => logErrorMessage(e));
  }
});

// Handle /logout command
bot.onText(/\/logout/, async (msg) => {
  const {
    chat: { username, id: chatId },
  } = msg;
  updateChatIdByUser(username!, chatId);

  if (username) {
    courseSession.coursesByUser[username]?.forEach((course) => course.job?.stop());
    await courseSession.updateCourseByUser(username, []);
    await tokenSession.deleteToken(username);
    await bot.sendMessage(chatId, "Tokens and courses removed.").catch((e) => logErrorMessage(e));
  }
});

// Handle callback query
bot.on("callback_query", async (query) => {
  const { data, message: { chat } = {} } = query;
  if (!chat || !data) {
    return;
  }
  const { username, id: chatId } = chat;
  updateChatIdByUser(username!, chatId);

  const [queryType, ...values] = data.split("|");

  switch (queryType) {
    case QueryType.VIEW_VIDEO: {
      const [urlKey, topicId] = values;
      await getVideosByUsername(username!, topicId, urlKey, bot);
      break;
    }
    case QueryType.SET_PUSHER_JOB: {
      const [urlKey] = values;
      const hourInPm = 12 + Number(urlKey[0]);

      const course = courseSession.coursesByUser[username!]?.find((course) => course.url_key === urlKey);

      // Clear existing job to prevent duplicate jobs
      if (course?.job) {
        course.job.stop();
      }

      const job = CronJob.from({
        cronTime: `30 ${hourInPm} * * 1-5`, // Every weekday
        onTick: async () => {
          const courses = await updateCourseByUsername(username!);
          const topicId = courses?.find((course) => course.url_key === urlKey)?.latest_topic_id;
          if (topicId) {
            await getVideosByUsername(username!, topicId, urlKey, bot);
          }
        },
        start: true,
        timeZone: "Asia/Hong_Kong",
      });
      if (course) {
        course.job = job;
      }

      await bot.sendMessage(chatId, `Course will be pushed every ${hourInPm}:30.`).catch((e) => logErrorMessage(e));

      break;
    }
  }
});

// Handle /debug command
bot.onText(/\/debug/, async (msg) => {
  const { username, id: chatId } = msg.chat;
  updateChatIdByUser(username!, chatId);

  console.log(`========== Chat Session ==========`);
  console.log(chatSession.chatByUser);
  console.log(`========== Course Session ==========`);
  console.log(courseSession.coursesByUser);
  console.log(`========== Token Session ==========`);
  console.log(tokenSession.tokenByUser);
});
