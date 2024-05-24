import { Command, ErrorCode, ErrorType } from "../types";
import wordings from "./wordings";

export const incorrectUsageMsg = (command: Command): string => {
  let msg = wordings.INCORRECT_COMMAND_USAGE;
  switch (command) {
    case Command.UPDATE_ACCESS_TOKEN:
      msg += "`/accesstoken YOUR_ACCESS_TOKEN_HERE`";
      break;
    case Command.UPDATE_REFRESH_TOKEN:
      msg += "`/refreshtoken YOUR_REFRESH_TOKEN_HERE`";
      break;
  }
  return msg;
};
export const logErrorMessage = (e: ErrorType): void => {
  switch (e.code) {
    case ErrorCode.EFATAL:
      console.log(e);
      break;
    case ErrorCode.EPARSE:
      console.log(e.response.body);
      break;
    case ErrorCode.ETELEGRAM:
      console.log(e.response.body.description);
      break;
  }
};
