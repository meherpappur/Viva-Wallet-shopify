import { getToken } from "../helpers/getToken.js";
import { searchDevices } from "../helpers/searchDevices.js";
import { initiateSale } from "../helpers/initiateSale.js";
import { pollSession } from "../helpers/pollSession.js";
const cashRegisterId = "POS-Wholesale";
const sourceCode = "123456";
let cache = {
  token: null,
  expiresAt: 0,
};

const BUFFER = 60 * 1000;

async function getCachedToken() {
  const now = Date.now();

  const valid = cache.token && cache.expiresAt - BUFFER > now;

  if (valid) return cache.token;

  const tokenData = await getToken(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
  );
  console.log(process.env.CLIENT_ID);
  cache = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in * 1000,
  };

  return cache.token;
}

export const action = async ({ request }) => {
  try {
    const body = await request.json();

    const { amount } = body;

    if (!amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        { status: 400 },
      );
    }

    const access_token = await getCachedToken();

    const devices = await searchDevices(access_token, {
      statusId: 1,
      sourceCode,
    });

    if (!devices || devices.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No active POS devices found",
        }),
        { status: 404 },
      );
    }

    const terminalId = devices[0].terminalId;

    const sale = await initiateSale(access_token, {
      terminalId,
      cashRegisterId,
      amount,
    });

    const result = await new Promise((resolve, reject) => {
      const { stop } = pollSession(
        access_token,
        sale.sessionId,
        (data) => {
          if (data.eventId === 1100) {
            stop();
            resolve(data);
          }

          if ([1200, 1201, 1300, 1400].includes(data.eventId)) {
            stop();
            reject(data);
          }
        },
        { intervalMs: 2000 },
      );

      setTimeout(() => {
        stop();
        reject({ error: "Payment timeout" });
      }, 30000);
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sale.sessionId,
        payment: result,
      }),
      { status: 200 },
    );
  } catch (err) {
    if (err?.status === 401) {
      cache = { token: null, expiresAt: 0 };
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Payment failed",
      }),
      { status: 500 },
    );
  }
};
