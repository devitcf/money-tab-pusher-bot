import { Command } from "../types/command";

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
