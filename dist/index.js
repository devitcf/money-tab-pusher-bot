"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const TelegramBot = require("node-telegram-bot-api");
const commands_1 = require("./helpers/commands");
const tokenSession_1 = require("./session/tokenSession");
const courseSession_1 = require("./session/courseSession");
const types_1 = require("./types");
const cron_1 = require("cron");
const courses_1 = require("./helpers/courses");
require("dotenv").config();
const bot = new TelegramBot((_a = process.env.TELEGRAM_BOT_TOKEN) !== null && _a !== void 0 ? _a : "", { polling: true });
// Start command
bot.onText(/\/start/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name: name, username } = msg.chat;
    if (!tokenSession_1.tokenSession.tokenByUser[username]) {
        bot.sendMessage(msg.chat.id, `Hi ${name}`).catch((e) => (0, commands_1.logErrorMessage)(e));
        bot
            .sendMessage(msg.chat.id, "In order to use this bot, please provide your access token by the command `/accesstoken YOUR_ACCESS_TOKEN_HERE`", { parse_mode: "Markdown" })
            .catch((e) => (0, commands_1.logErrorMessage)(e));
    }
}));
// Handle /accessToken command
bot.onText(/\/accesstoken(.*)/, (msg, match) => {
    if (!(match === null || match === void 0 ? void 0 : match[1])) {
        bot
            .sendMessage(msg.chat.id, (0, commands_1.incorrectUsageMsg)(types_1.Command.UPDATE_ACCESS_TOKEN), {
            parse_mode: "Markdown",
        })
            .catch((e) => (0, commands_1.logErrorMessage)(e));
        return;
    }
    const accessToken = match[1].replace(" ", "");
    tokenSession_1.tokenSession.updateAccessToken(msg.chat.username, accessToken);
    bot.sendMessage(msg.chat.id, "Access token saved.").catch((e) => (0, commands_1.logErrorMessage)(e));
});
// Handle /refreshToken command
bot.onText(/\/refreshtoken(.*)/, (msg, match) => {
    if (!(match === null || match === void 0 ? void 0 : match[1])) {
        bot
            .sendMessage(msg.chat.id, (0, commands_1.incorrectUsageMsg)(types_1.Command.UPDATE_REFRESH_TOKEN), {
            parse_mode: "Markdown",
        })
            .catch((e) => (0, commands_1.logErrorMessage)(e));
        return;
    }
    const refreshToken = match[1].replace(" ", "");
    tokenSession_1.tokenSession.updateRefreshToken(msg.chat.username, refreshToken);
    bot.sendMessage(msg.chat.id, "Refresh token saved.").catch((e) => (0, commands_1.logErrorMessage)(e));
});
// Handle /course command
bot.onText(/\/course/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { chat: { username, id }, } = msg;
    if (username) {
        yield (0, courses_1.updateCourseByUsername)(username, bot, id);
    }
}));
// Handle /logout command
bot.onText(/\/logout/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { chat: { username, id }, } = msg;
    if (username) {
        (_b = courseSession_1.courseSession.courseByUser[username]) === null || _b === void 0 ? void 0 : _b.forEach((course) => { var _a; return (_a = course.job) === null || _a === void 0 ? void 0 : _a.stop(); });
        delete courseSession_1.courseSession.courseByUser[username];
        delete tokenSession_1.tokenSession.tokenByUser[username];
    }
}));
// Handle callback query
bot.on("callback_query", (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const { data, message: { chat } = {} } = query;
    if (!chat || !data) {
        return;
    }
    const { id: chatId, username } = chat;
    const [queryType, ...values] = data.split("|");
    switch (queryType) {
        case types_1.QueryType.VIEW_VIDEO: {
            const [urlKey, topicId] = values;
            yield (0, courses_1.getVideosByUsername)(username, topicId, urlKey, bot, chatId);
            break;
        }
        case types_1.QueryType.SET_PUSHER_JOB: {
            const [chatId, urlKey] = values;
            const job = cron_1.CronJob.from({
                cronTime: `1 ${urlKey[0]} * * * *`,
                onTick: () => __awaiter(void 0, void 0, void 0, function* () {
                    var _f;
                    const courses = yield (0, courses_1.updateCourseByUsername)(username);
                    const topicId = (_f = courses === null || courses === void 0 ? void 0 : courses.find((course) => course.url_key === urlKey)) === null || _f === void 0 ? void 0 : _f.latest_topic_id;
                    if (topicId) {
                        yield (0, courses_1.getVideosByUsername)(username, topicId, urlKey, bot, Number(chatId));
                    }
                }),
                start: true,
                timeZone: "Asia/Hong_Kong",
            });
            const course = (_c = courseSession_1.courseSession.courseByUser[username]) === null || _c === void 0 ? void 0 : _c.find((course) => course.url_key === urlKey);
            if (course) {
                course.job = job;
            }
            break;
        }
        case types_1.QueryType.CLEAR_PUSHER_JOB: {
            const [urlKey] = values;
            const course = (_d = courseSession_1.courseSession.courseByUser[username]) === null || _d === void 0 ? void 0 : _d.find((course) => course.url_key === urlKey);
            if (course) {
                (_e = course.job) === null || _e === void 0 ? void 0 : _e.stop();
                course.job = undefined;
            }
            break;
        }
    }
}));
//# sourceMappingURL=index.js.map