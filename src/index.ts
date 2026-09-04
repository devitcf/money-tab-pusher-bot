import { CronJob } from "cron";
import { createServer, IncomingMessage, ServerResponse } from "http";
import TelegramBot from "node-telegram-bot-api";
import { chatSession } from "./session/chatSession";
import { courseSession } from "./session/courseSession";
import { tokenSession } from "./session/tokenSession";
import { incorrectUsageMsg, logErrorMessage } from "./helpers/commands";
import { getVideosByUsername, updateCourseByUsername } from "./helpers/courses";
import { QueryType, Command } from "./types";

require("dotenv").config();

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const webhookSecret = process.env.WEBHOOK_SECRET;
const port = Number(process.env.PORT ?? 3000);

if (!telegramBotToken || !webhookUrl || !webhookSecret) {
  throw new Error("TELEGRAM_BOT_TOKEN, WEBHOOK_URL, and WEBHOOK_SECRET are required.");
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

const parsedWebhookUrl = new URL(webhookUrl);
if (parsedWebhookUrl.protocol !== "https:") {
  throw new Error("WEBHOOK_URL must use HTTPS.");
}

const webhookPath = parsedWebhookUrl.pathname;
const bot = new TelegramBot(telegramBotToken, {
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

bot.on("webhook_error", (error) => {
  console.log(`[${new Date().toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" })}] ${error}`);
});

const sendResponse = (response: ServerResponse, statusCode: number, body: string) => {
  response.writeHead(statusCode, { "Content-Type": "text/plain" });
  response.end(body);
};

const handleWebhookRequest = (request: IncomingMessage, response: ServerResponse) => {
  const requestPath = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;

  if (request.method === "GET" && requestPath === "/healthz") {
    sendResponse(response, 200, "OK");
    return;
  }

  if (request.method !== "POST" || requestPath !== webhookPath) {
    sendResponse(response, 404, "Not found");
    return;
  }

  if (request.headers["x-telegram-bot-api-secret-token"] !== webhookSecret) {
    sendResponse(response, 401, "Unauthorized");
    return;
  }

  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk: string) => {
    body += chunk;
  });
  request.on("end", () => {
    try {
      bot.processUpdate(JSON.parse(body) as TelegramBot.Update);
      sendResponse(response, 200, "OK");
    } catch (error) {
      console.error("Failed to process Telegram update:", error);
      sendResponse(response, 400, "Invalid update");
    }
  });
};

const server = createServer(handleWebhookRequest);

const start = async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", () => {
      server.off("error", reject);
      resolve();
    });
  });

  try {
    await bot.setWebHook(webhookUrl, { secret_token: webhookSecret });
    console.log(`Telegram webhook listening on port ${port}`);
  } catch (error) {
    server.close();
    throw error;
  }
};

const shutdown = async () => {
  courseSession.coursesByUser &&
    Object.values(courseSession.coursesByUser).forEach((courses) => courses.forEach((course) => course.job?.stop()));

  await new Promise<void>((resolve) => server.close(() => resolve()));
};

process.once("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.once("SIGTERM", () => void shutdown().then(() => process.exit(0)));

void start().catch((error) => {
  console.error("Failed to start Telegram webhook:", error);
  process.exit(1);
});
