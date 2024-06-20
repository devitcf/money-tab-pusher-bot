import { Course } from "../types";
import { tokenSession } from "../session/tokenSession";
import { renewToken } from "./auth";

export const getCourses = async (username: string, retry = true): Promise<{ value: Course[] | undefined }> => {
  const token = tokenSession.getToken(username);

  const url = "https://api.money-tab.com/api/student/get-course";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token?.accessToken}` },
  });

  if (res.status === 500) {
    throw new Error(res.statusText);
  }
  if (res.status === 401 && retry) {
    if (token?.refreshToken) {
      const tokenRes = await renewToken(token.refreshToken);
      tokenSession.updateAccessToken(username, tokenRes.accessToken);
      tokenSession.updateRefreshToken(username, tokenRes.refreshToken);
      return getCourse(username, false);
      return getCourses(username, false);
    }
    throw new Error(res.statusText);
  }

  return res.json();
};
