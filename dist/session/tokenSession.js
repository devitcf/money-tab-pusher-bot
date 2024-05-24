"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenSession = void 0;
class TokenSession {
    constructor() {
        this.tokenByUser = {};
    }
    getToken(username) {
        if (!username)
            return undefined;
        return this.tokenByUser[username];
    }
    updateAccessToken(username, accessToken) {
        this.tokenByUser[username] = Object.assign(Object.assign({}, this.tokenByUser[username]), { accessToken });
    }
    updateRefreshToken(username, refreshToken) {
        this.tokenByUser[username] = Object.assign(Object.assign({}, this.tokenByUser[username]), { refreshToken });
    }
}
exports.tokenSession = new TokenSession();
//# sourceMappingURL=tokenSession.js.map