export enum ErrorCode {
  EFATAL = "EFATAL",
  EPARSE = "EPARSE",
  ETELEGRAM = "ETELEGRAM",
}

export type FatalError = {
  code: ErrorCode.EFATAL;
};

export type ParseError = {
  code: ErrorCode.EPARSE;
  response: {
    body: string;
  };
};

export type TelegramError = {
  code: ErrorCode.ETELEGRAM;
  response: {
    body: {
      description: string;
      [key: string]: any;
    };
  };
};

export type ErrorType = FatalError | ParseError | TelegramError;
