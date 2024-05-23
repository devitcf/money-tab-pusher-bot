export const Command = {
  UPDATE_ACCESS_TOKEN: "accesstoken",
  UPDATE_REFRESH_TOKEN: "refreshtoken",
  SET_COURSE: "course",
  LOGOUT: "logout",
} as const;
export type Command = (typeof Command)[keyof typeof Command];
