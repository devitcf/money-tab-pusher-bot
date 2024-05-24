"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErrorMessage = exports.incorrectUsageMsg = void 0;
const types_1 = require("../types");
const wordings_1 = __importDefault(require("./wordings"));
const incorrectUsageMsg = (command) => {
    let msg = wordings_1.default.INCORRECT_COMMAND_USAGE;
    switch (command) {
        case types_1.Command.UPDATE_ACCESS_TOKEN:
            msg += "`/accesstoken YOUR_ACCESS_TOKEN_HERE`";
            break;
        case types_1.Command.UPDATE_REFRESH_TOKEN:
            msg += "`/refreshtoken YOUR_REFRESH_TOKEN_HERE`";
            break;
    }
    return msg;
};
exports.incorrectUsageMsg = incorrectUsageMsg;
const logErrorMessage = (e) => {
    switch (e.code) {
        case types_1.ErrorCode.EFATAL:
            console.log(e);
            break;
        case types_1.ErrorCode.EPARSE:
            console.log(e.response.body);
            break;
        case types_1.ErrorCode.ETELEGRAM:
            console.log(e.response.body.description);
            break;
    }
};
exports.logErrorMessage = logErrorMessage;
//# sourceMappingURL=commands.js.map