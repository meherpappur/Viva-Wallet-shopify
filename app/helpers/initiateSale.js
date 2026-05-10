import { log } from "./logger.js";
import { URLS, VIVA_ENV, EVENT_CODES } from "./config.js";
import { generateSessionId } from "./generateSessionId.js";

export async function initiateSale(token, params, env = VIVA_ENV) {
 const {
  terminalId,
  cashRegisterId,
  amount,
  sessionId,
  tipAmount = 0,
  currencyCode = "978",
  customerTrns = "Shopify POS sale",
} = params;

  if (!terminalId || !cashRegisterId || !amount) {
    throw new Error("Missing required fields");
  }

  const resolvedSessionId = sessionId || generateSessionId();

  const payload = {
  sessionId: resolvedSessionId,
  terminalId,
  cashRegisterId,
  amount,
  tipAmount,
  currencyCode,
  merchantReference: "6e4d8cd5-68ad-4f82-9b55-26bb34a8e786",
  customerTrns,
};

  const url = `${URLS[env].api}/ecr/v1/transactions:sale`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

let data = {};
if (text) {
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
}

  if (!res.ok) {
    log("err", "initiateSale", "Failed", data);
    throw new Error(JSON.stringify(data));
  }

  log("ok", "initiateSale", EVENT_CODES[data.eventId] || "unknown");

  return { ...data, sessionId: resolvedSessionId };
}
