export const VIVA_ENV = process.env.VIVA_ENV || "demo";

export const URLS = {
  demo: {
    token: "https://demo-accounts.vivapayments.com/connect/token",
    api: "https://demo-api.vivapayments.com",
  },
  prod: {
    token: "https://accounts.vivapayments.com/connect/token",
    api: "https://api.vivapayments.com",
  },
};

export const EVENT_CODES = {
  1100: "Session saved successfully",
  1102: "Session retrieved successfully",
  1200: "Bad request data",
  1201: "SessionId already exists",
  1300: "Database save error",
  1400: "Server temporarily overloaded",
};