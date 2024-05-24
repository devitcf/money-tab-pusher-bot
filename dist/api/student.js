"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourse = void 0;
const tokenSession_1 = require("../session/tokenSession");
const auth_1 = require("./auth");
const getCourse = (username_1, ...args_1) => __awaiter(void 0, [username_1, ...args_1], void 0, function* (username, retry = true) {
    const token = tokenSession_1.tokenSession.getToken(username);
    const url = "https://api.money-tab.com/api/student/get-course";
    const res = yield fetch(url, {
        headers: { Authorization: `Bearer ${token === null || token === void 0 ? void 0 : token.accessToken}` },
    });
    if (res.status === 500) {
        throw new Error(res.statusText);
    }
    if (res.status === 401 && retry) {
        if (token === null || token === void 0 ? void 0 : token.refreshToken) {
            const tokenRes = yield (0, auth_1.renewToken)(token.refreshToken);
            tokenSession_1.tokenSession.updateAccessToken(username, tokenRes.accessToken);
            tokenSession_1.tokenSession.updateRefreshToken(username, tokenRes.refreshToken);
            return (0, exports.getCourse)(username, false);
        }
        throw new Error(res.statusText);
    }
    return res.json();
});
exports.getCourse = getCourse;
//# sourceMappingURL=student.js.map