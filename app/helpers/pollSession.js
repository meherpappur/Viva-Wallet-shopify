import { log } from "./logger.js";
import { getSessionById } from "./getSessionById.js";
import { VIVA_ENV } from "./config.js";

export function pollSession(token, sessionId, onResult, opts = {}) {
  const intervalMs = opts.intervalMs || 3000;
  const env = opts.env || VIVA_ENV;

  const id = setInterval(async () => {
    try {
      const data = await getSessionById(token, sessionId, env);
      onResult(data);
    } catch (e) {
      log("err", "pollSession", e.message);
    }
  }, intervalMs);

  return {
    stop: () => {
      clearInterval(id);
      log("warn", "pollSession", "Stopped");
    },
  };
}