import { log } from "./logger.js";
import { getSessionById } from "./getSessionById.js";
import { VIVA_ENV } from "./config.js";

export function pollSession(token, sessionId, onResult, opts = {}) {
  const intervalMs = opts.intervalMs ?? 3000;
  const maxAttempts = opts.maxAttempts ?? 20;
  const env = opts.env ?? VIVA_ENV;

  let attempts = 0;
  let stopped = false;
  let timeoutId = null;

  async function tick() {
    if (stopped) return;

    attempts++;
    if (attempts > maxAttempts) {
      log("warn", "pollSession", `Max attempts (${maxAttempts}) reached`);
      stop("timeout");
      return;
    }

    try {
      const { status, data } = await getSessionById(token, sessionId, env);
      console.log("Poll", data);
      switch (status) {
        case 200:
          // Terminal: success or failure
          onResult({ done: true, success: data.success, data });
          stop("done");
          break;

        case 202:
          // Still processing — keep polling
          onResult({ done: false, data });
          scheduleNext();
          break;

        case 400:
          log("err", "pollSession", "Bad request — check sessionId or params");
          onResult({ done: true, success: false, error: "bad_request", data });
          stop("bad_request");
          break;

        case 401:
          log("err", "pollSession", "Unauthorized — token may be expired");
          onResult({ done: true, success: false, error: "unauthorized", data });
          stop("unauthorized");
          break;

        case 404:
          log("err", "pollSession", `Session not found: ${sessionId}`);
          onResult({ done: true, success: false, error: "not_found", data });
          stop("not_found");
          break;

        case 503:
          // Transient — retry
          log("warn", "pollSession", "Service unavailable (503), retrying...");
          scheduleNext();
          break;

        default:
          if (status >= 500) {
            // 5xx — retry up to maxAttempts
            log("warn", "pollSession", `Server error ${status}, retrying...`);
            scheduleNext();
          } else {
            log("err", "pollSession", `Unexpected status ${status}`);
            onResult({
              done: true,
              success: false,
              error: `unexpected_${status}`,
              data,
            });
            stop(`unexpected_${status}`);
          }
      }
    } catch (e) {
      // Network-level failure — retry
      log("err", "pollSession", `Network error: ${e.message}`);
      scheduleNext();
    }
  }

  function scheduleNext() {
    if (!stopped) {
      timeoutId = setTimeout(tick, intervalMs);
    }
  }

  function stop(reason) {
    stopped = true;
    clearTimeout(timeoutId);
    log("warn", "pollSession", `Stopped — reason: ${reason}`);
  }

  timeoutId = setTimeout(tick, 0);

  return { stop };
}
