import { log } from "./logger.js";
import { URLS, VIVA_ENV } from "./config.js";

export async function searchDevices(
  token,
  { statusId = 1, sourceCode } = {},
  env = VIVA_ENV
) {
  const url = `${URLS[env].api}/ecr/v1/devices:search`;

  const payload = {};

  if (statusId !== undefined) payload.statusId = statusId;
  if (sourceCode) payload.sourceCode = sourceCode;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: Object.keys(payload).length ? JSON.stringify(payload) : "{}",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    log("err", "searchDevices", "Failed", data);
    throw new Error(data?.message || "Failed to fetch devices");
  }

  return data?.devices || data || [];
}