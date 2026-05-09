import { log } from "./logger.js";
import { URLS, VIVA_ENV } from "./config.js";

export async function searchDevicesISV(
  token,
  { merchantId, statusId = 1, sourceCode } = {},
  env = VIVA_ENV
) {
  if (!merchantId) throw new Error("merchantId required");

  const url = `${URLS[env].api}/ecr/isv/v1/devices:search`;

  const payload = { merchantId, statusId, sourceCode };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    log("err", "searchDevicesISV", "Failed", data);
    throw new Error(JSON.stringify(data));
  }

  return data;
}