export const Command = {
  UPDATE_ACCESS_TOKEN: "/accesstoken",
  UPDATE_REFRESH_TOKEN: "/refreshtoken",
} as const;
export type Command = (typeof Command)[keyof typeof Command];
