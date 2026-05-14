import { authenticate } from "../shopify.server";
import { UPDATE_METAFIELD_MUTATION } from "../constants/queries";

export const action = async ({ request }) => {
  try {
    const { payload, topic, shop, admin } = await authenticate.webhook(request);

    // ✅ Fix 1: Define `order` from `payload`
    const order = payload;

    console.log("📦 Shopify Webhook Received");
    console.log("Webhook topic:", topic);
    console.log("Shop:", shop);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("🧾 Order ID:", order?.id);

    const ownerId = `gid://shopify/Order/${order.id}`;

    // ✅ Fix 2: REST webhook payloads always use snake_case — no `sourceName`
    const source = order?.source_name;
    console.log("🔌 Source:", source);

    // ✅ Fix 3: REST webhook payloads use `note_attributes` only, not `customAttributes`
    const attributes = order?.note_attributes || [];

    const vivaAttr = attributes.find((attr) => attr.name === "vivaReferenceId");
    const vivaReferenceId = vivaAttr?.value;
    console.log("💳 Viva Reference ID:", vivaReferenceId);

    const isPOS = source === "pos";

    if (!isPOS || !vivaReferenceId) {
      console.log("⚠️ Skipping order (not POS or missing Viva reference)");
      return new Response("Ignored", { status: 200 });
    }

    const paymentVerifiedBy = "Viva";

    const metafields = [
      {
        ownerId,
        namespace: "custom",
        key: "payment_verified",
        type: "boolean",
        value: "true",
      },
      {
        ownerId,
        namespace: "custom",
        key: "payment_verified_by",
        type: "list.single_line_text_field",
        value: JSON.stringify([paymentVerifiedBy]),
      },
    ];

    console.log("🧩 Metafields payload:", metafields);

    const response = await admin.graphql(UPDATE_METAFIELD_MUTATION, {
      variables: { metafields },
    });

    const result = await response.json();
    console.log("📡 Shopify response:", JSON.stringify(result));

    const userErrors = result?.data?.metafieldsSet?.userErrors;

    if (userErrors?.length) {
      console.log("❌ User errors:", userErrors);
      return new Response("Metafield error", { status: 500 });
    }

    console.log("🎉 Order marked as VERIFIED by Viva");
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return new Response("Error", { status: 500 });
  }
};
