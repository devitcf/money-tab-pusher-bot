import { QueryType } from "../types";

export const getSetSubscriptionKeyboard = (chatId: number, urlKey: string) => [
  {
    text: `Push ${urlKey} to me every ${urlKey[0]}pm`,
    callback_data: `${QueryType.SET_PUSHER_JOB}|${chatId}|${urlKey}`,
  },
];
