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
exports.renewToken = void 0;
const renewToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://api.money-tab.com/api/user_auth/refresh";
    const res = yield fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken, user_type: "student" }),
    });
    const jsonRes = yield res.json();
    return { accessToken: jsonRes.access_token, refreshToken: jsonRes.refresh_token };
});
exports.renewToken = renewToken;
//# sourceMappingURL=auth.js.map