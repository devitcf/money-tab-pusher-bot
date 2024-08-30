import fse from "fs-extra";

const tokenJsonFile = `/app/storage/token.json`;

class TokenSession {
  tokenByUser: { [username: string]: { accessToken: string; refreshToken?: string } } = {};

  constructor() {
    const exists = fse.pathExistsSync(tokenJsonFile);
    if (!exists) return;

    console.log("token.json exists, importing...");
    fse
      .readJson(tokenJsonFile, { throws: false })
      .then((obj) => {
        if (obj) {
          this.tokenByUser = obj;
        }
      })
      .catch((err) => {
        console.error(err); // Not called
      });
  }

  getToken(username?: string) {
    if (!username) return undefined;
    return this.tokenByUser[username];
  }

  async updateAccessToken(username: string, accessToken: string) {
    this.tokenByUser[username] = { ...this.tokenByUser[username], accessToken };
    await fse.outputJson(tokenJsonFile, this.tokenByUser);
  }

  async updateRefreshToken(username: string, refreshToken: string) {
    this.tokenByUser[username] = { ...this.tokenByUser[username], refreshToken };
    await fse.outputJson(tokenJsonFile, this.tokenByUser);
  }

  async deleteToken(username: string) {
    delete this.tokenByUser[username];
    await fse.outputJson(tokenJsonFile, this.tokenByUser);
  }
}

export const tokenSession = new TokenSession();
