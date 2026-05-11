import { getSessionById } from "../helpers/getSessionById";

export const action = async ({ request }) => {
  try {
    const body = await request.json();

    const { access_token, sessionId } = body;

    // Validation
    if (!access_token?.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Access token is required",
        }),
        { status: 400 },
      );
    }

    if (!sessionId?.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session ID is required",
        }),
        { status: 400 },
      );
    }

    // Get session
    const result = await getSessionById(access_token, sessionId);
    console.log("Session", result);
    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || err?.error || "Failed to retrieve session",
      }),
      { status: 500 },
    );
  }
};
