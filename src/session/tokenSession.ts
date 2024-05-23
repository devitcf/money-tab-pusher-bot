class TokenSession {
  tokenByUser: { [username: string]: { accessToken: string; refreshToken?: string } } = {};

  getToken(username?: string) {
    if (!username) return undefined;
    return this.tokenByUser[username];
  }

  updateAccessToken(username: string, accessToken: string) {
    this.tokenByUser[username] = { ...this.tokenByUser[username], accessToken };
  }

  updateRefreshToken(username: string, refreshToken: string) {
    this.tokenByUser[username] = { ...this.tokenByUser[username], refreshToken };
  }
}

export const tokenSession = new TokenSession();
