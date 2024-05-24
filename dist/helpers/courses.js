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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideosByUsername = exports.updateCourseByUsername = void 0;
const tokenSession_1 = require("../session/tokenSession");
const api_1 = require("../api");
const courseSession_1 = require("../session/courseSession");
const wordings_1 = __importDefault(require("./wordings"));
const types_1 = require("../types");
const commands_1 = require("./commands");
const inlineKeyboards_1 = require("./inlineKeyboards");
const updateCourseByUsername = (username, bot, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const token = tokenSession_1.tokenSession.getToken(username);
    if (!token || !(token === null || token === void 0 ? void 0 : token.accessToken)) {
        if (bot && chatId) {
            bot
                .sendMessage(chatId, wordings_1.default.MISSING_TOKEN_MSG, {
                parse_mode: "Markdown",
            })
                .catch((e) => (0, commands_1.logErrorMessage)(e));
            return;
        }
    }
    const res = yield (0, api_1.getCourse)(username);
    const courses = res.value;
    courseSession_1.courseSession.updateCourseByUser(username, courses);
    if (bot && chatId) {
        bot
            .sendMessage(chatId, wordings_1.default.SELECT_YOUR_COURSE, {
            reply_markup: {
                inline_keyboard: [
                    courses.map((course) => ({
                        text: course.title,
                        callback_data: `${types_1.QueryType.VIEW_VIDEO}|${course.url_key}|${course.latest_topic_id}`,
                    })),
                ],
            },
        })
            .catch((e) => (0, commands_1.logErrorMessage)(e));
    }
    return courses;
});
exports.updateCourseByUsername = updateCourseByUsername;
const getVideosByUsername = (username, topicId, urlKey, bot, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const res = yield (0, api_1.getPaidVideo)(username, topicId);
    if (!res.videos) {
        return;
    }
    let responseText = "";
    for (const video of res.videos) {
        responseText += `${video.title} \n\n ${(_a = video.youtube) === null || _a === void 0 ? void 0 : _a.video_url}`;
    }
    let course;
    if (urlKey && bot && chatId) {
        course = (_b = courseSession_1.courseSession.courseByUser[username]) === null || _b === void 0 ? void 0 : _b.find((course) => course.url_key === urlKey);
        const inlineKeyboard = (course === null || course === void 0 ? void 0 : course.job)
            ? (0, inlineKeyboards_1.getClearSubscriptionKeyboard)(urlKey)
            : (0, inlineKeyboards_1.getSetSubscriptionKeyboard)(chatId, urlKey);
        bot
            .sendMessage(chatId, responseText, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [inlineKeyboard],
            },
        })
            .catch((e) => (0, commands_1.logErrorMessage)(e));
    }
    return responseText;
});
exports.getVideosByUsername = getVideosByUsername;
//# sourceMappingURL=courses.js.map