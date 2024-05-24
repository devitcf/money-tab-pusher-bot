"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetSubscriptionKeyboard = exports.getClearSubscriptionKeyboard = void 0;
const types_1 = require("../types");
const getClearSubscriptionKeyboard = (urlKey) => [
    {
        text: `Clear subscription for ${urlKey}`,
        callback_data: `${types_1.QueryType.CLEAR_PUSHER_JOB}|${urlKey}`,
    },
];
exports.getClearSubscriptionKeyboard = getClearSubscriptionKeyboard;
const getSetSubscriptionKeyboard = (chatId, urlKey) => [
    {
        text: `Push ${urlKey} to me every ${urlKey[0]}pm`,
        callback_data: `${types_1.QueryType.SET_PUSHER_JOB}|${chatId}|${urlKey}`,
    },
];
exports.getSetSubscriptionKeyboard = getSetSubscriptionKeyboard;
//# sourceMappingURL=inlineKeyboards.js.map