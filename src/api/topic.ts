import { tokenSession } from "../session/tokenSession";
import { Video } from "../types";
import { renewToken } from "./auth";

export const getPaidVideo = async (username: string, topicId: string, retry = true): Promise<{ videos: Video[] }> => {
  const token = tokenSession.getToken(username);

  const url = `https://api.money-tab.com/api/topic/paid-video?topic_id=${topicId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token?.accessToken}` },
  });

  if (res.status === 500) {
    throw new Error(res.statusText);
  }
  if (res.status === 401 && retry) {
    if (token?.refreshToken) {
      const tokenRes = await renewToken(token.refreshToken);
      await tokenSession.updateAccessToken(username, tokenRes.accessToken);
      await tokenSession.updateRefreshToken(username, tokenRes.refreshToken);
      return getPaidVideo(username, topicId, false);
    }
    throw new Error(res.statusText);
  }

  return res.json();
};
