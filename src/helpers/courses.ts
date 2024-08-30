import { tokenSession } from "../session/tokenSession";
import { getCourses, getPaidVideo } from "../api";
import { courseSession } from "../session/courseSession";
import wordings from "./wordings";
import { QueryType, UserCourse, Video } from "../types";
import { getSetSubscriptionKeyboard } from "./inlineKeyboards";
import { chatSession } from "../session/chatSession";
import TelegramBot from "node-telegram-bot-api";
import { logErrorMessage } from "./commands";

export const updateCourseByUsername = async (username: string, bot?: TelegramBot) => {
  const chatId = chatSession.chatByUser[username]?.chatId as number | undefined;

  const token = tokenSession.getToken(username);
  if (!token || !token?.accessToken) {
    if (chatId) {
      bot
        ?.sendMessage(chatId, wordings.MISSING_TOKEN_MSG, {
          parse_mode: "Markdown",
        })
        .catch((e) => logErrorMessage(e));
    }
    return;
  }

  // Fetch new courses
  let courses: UserCourse[] = [];
  try {
    const res = await getCourses(username);
    courses = res.value ?? [];
  } catch (e: unknown) {
    console.error(wordings.ERROR_FETCHING_API);
    if (chatId) {
      bot?.sendMessage(chatId, wordings.ERROR_FETCHING_API).catch((e) => logErrorMessage(e));
    }
  }

  await courseSession.updateCourseByUser(username, courses);

  const options =
    courses.length > 0
      ? {
          reply_markup: {
            inline_keyboard: [
              courses.map((course) => ({
                text: course.title,
                callback_data: `${QueryType.VIEW_VIDEO}|${course.url_key}|${course.latest_topic_id}`,
              })),
            ],
          },
        }
      : undefined;

  const text = courses.length === 0 ? wordings.NO_COURSES_FOUND : wordings.SELECT_YOUR_COURSE;

  if (chatId) await bot?.sendMessage(chatId, text, options).catch((e) => logErrorMessage(e));
  return courses;
};

export const getVideosByUsername = async (username: string, topicId: string, urlKey?: string, bot?: TelegramBot) => {
  const chatId = chatSession.chatByUser[username]?.chatId as number | undefined;

  let videos: Video[] = [];
  try {
    const res = await getPaidVideo(username, topicId);
    videos = res.videos ?? [];
  } catch (e: unknown) {
    console.error(wordings.ERROR_FETCHING_API);
    if (bot && chatId) {
      bot?.sendMessage(chatId, wordings.ERROR_FETCHING_API).catch((e) => logErrorMessage(e));
    }
  }

  if (!videos || videos.length === 0) {
    if (bot && chatId) {
      bot?.sendMessage(chatId, wordings.NO_VIDEOS_FOUND).catch((e) => logErrorMessage(e));
    }
    return;
  }

  let responseText = "";
  for (const video of videos) {
    responseText += `${video.title} \n\n ${video.youtube?.video_url}`;
  }

  let course: UserCourse | undefined;
  if (urlKey && bot && chatId) {
    course = courseSession.coursesByUser[username!]?.find((course) => course.url_key === urlKey);
    const inlineKeyboard = course?.job ? [] : [getSetSubscriptionKeyboard(urlKey)];

    bot
      .sendMessage(chatId, responseText, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      })
      .catch((e) => logErrorMessage(e));
  }
  return responseText;
};
