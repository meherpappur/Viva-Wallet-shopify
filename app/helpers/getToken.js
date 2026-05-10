import { log } from "./logger.js";
import { URLS, VIVA_ENV } from "./config.js";

export async function getToken(clientId, clientSecret, env = VIVA_ENV) {
  const url = URLS[env].token;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    log("err", "getToken", "Failed", data);
    throw new Error(JSON.stringify(data));
  }

  log("ok", "getToken", "Token received");

  return data;
}
