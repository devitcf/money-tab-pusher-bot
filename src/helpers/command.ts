import { Command, ErrorCode, ErrorType } from "../types";

export const incorrectUsageMsg = (command: Command): string => {
  let msg = "Incorrect command usage. The usage should be: \n";
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
