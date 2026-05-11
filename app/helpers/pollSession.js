import { log } from "./logger.js";
import { getSessionById } from "./getSessionById.js";
import { VIVA_ENV } from "./config.js";

export function pollSession(token, sessionId, onResult, opts = {}) {
  const intervalMs = opts.intervalMs || 5000;
  const timeoutMs = opts.timeoutMs || 90000;
  const env = opts.env || VIVA_ENV;

  const startTime = Date.now();

  const id = setInterval(async () => {
    try {
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(id);
        log("err", "pollSession", "Timeout reached");
        onResult({
          status: "TIMEOUT",
          success: false,
          message: "Payment timed out",
        });
        return;
      }

      const data = await getSessionById(token, sessionId, env);

      const eventId = data?.eventId || data?.payment?.eventId;
      const success = data?.success;

      const isSuccess =
        success === true &&
        data?.message?.toLowerCase().includes("successful");

      const isFailed =
        success === false || [1200, 1201, 1300, 1400].includes(eventId);

      const isPending = success == null && !isSuccess && !isFailed;

      if (isSuccess) {
        clearInterval(id);
        log("ok", "pollSession", "SUCCESS");
        onResult({
          status: "SUCCESS",
          success: true,
          data,
        });
        return;
      }

      if (isFailed) {
        clearInterval(id);
        log("err", "pollSession", "FAILED");
        onResult({
          status: "FAILED",
          success: false,
          data,
        });
        return;
      }

      if (isPending) {
        log("info", "pollSession", "PENDING");
        onResult({
          status: "PENDING",
          success: null,
          data,
        });
      }
    } catch (e) {
      log("err", "pollSession", e.message);

      onResult({
        status: "ERROR",
        success: false,
        error: e.message,
      });
    }
  }, intervalMs);

  return {
    stop: () => {
      clearInterval(id);
      log("warn", "pollSession", "Stopped");
    },
  };
}
