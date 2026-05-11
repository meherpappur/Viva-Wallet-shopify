import { log } from "./logger.js";
import { URLS, VIVA_ENV, EVENT_CODES } from "./config.js";

export async function getSessionById(token, sessionId, env = VIVA_ENV) {
  const url = `${URLS[env].api}/ecr/v1/sessions/${sessionId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    log("err", "getSessionById", "Failed", data);
    throw new Error(JSON.stringify(data));
  }

  return data;
}