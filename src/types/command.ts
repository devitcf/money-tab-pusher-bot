export const Command = {
  UPDATE_ACCESS_TOKEN: "/accesstoken",
  UPDATE_REFRESH_TOKEN: "/refreshtoken",
} as const;
export type Command = (typeof Command)[keyof typeof Command];

export const QueryType = {
  VIEW_VIDEO: "VIEW_VIDEO",
  SET_PUSHER_JOB: "SET_PUSHER_JOB",
  CLEAR_PUSHER_JOB: "CLEAR_PUSHER_JOB",
} as const;
export type QueryType = (typeof QueryType)[keyof typeof QueryType];
