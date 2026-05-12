import { getToken } from "../helpers/getToken.js";
import { initiateSale } from "../helpers/initiateSale.js";
import { pollSession } from "../helpers/pollSession.js";

const cashRegisterId = "POS-Wholesale";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

let cache = {
  token: null,
  expiresAt: 0,
};

const BUFFER = 60 * 1000;

async function getCachedToken() {
  const now = Date.now();

  const valid = cache.token && cache.expiresAt - BUFFER > now;

  if (valid) {
    return cache.token;
  }

  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error("Missing Viva client credentials");
  }

  const tokenData = await getToken(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
  );

  cache = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in * 1000,
  };

  return cache.token;
}

// IMPORTANT FOR PREFLIGHT
export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return new Response("OK", {
    headers: corsHeaders,
  });
};

export const action = async ({ request }) => {
  // HANDLE OPTIONS INSIDE ACTION TOO
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const access_token = await getCachedToken();
    console.log("Token", access_token);
    const terminalId = "16731762";

    const sale = await initiateSale(access_token, {
      terminalId,
      cashRegisterId,
      amount,
      tipAmount: 0,
      currencyCode: "978",
      merchantReference: `6e4d8cd5-68ad-4f82-9b55-26bb34a8e786`,
      customerTrns: "Shopify POS sale",
    });

    const result = await new Promise((resolve, reject) => {
      const { stop } = pollSession(
        access_token,
        sale.sessionId,
        (state) => {
          if (state.status === "SUCCESS") {
            stop();
            resolve(state);
          }

          if (state.status === "FAILED" || state.status === "TIMEOUT") {
            stop();
            reject(state);
          }
        },
        {
          intervalMs: 10000,
          timeoutMs: 300000,
        },
      );
    });

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: sale.sessionId,
        payment: result,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (err) {
    if (err?.status === 401) {
      cache = {
        token: null,
        expiresAt: 0,
      };
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || err?.error || "Payment failed",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};
