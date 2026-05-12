export const action = async ({ request, context }) => {
  try {
    const order = await request.json();

    console.log("📦 Shopify Webhook Received");
    console.log("🧾 Order ID:", order?.id);

    const ownerId = `gid://shopify/Order/${order.id}`;

    const source = order?.source_name || order?.sourceName;
    console.log("🔌 Source:", source);

    const attributes = order?.customAttributes || order?.note_attributes || [];

    const vivaAttr = attributes.find((attr) => attr.key === "vivaReferenceId");

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

    const response = await context.admin.graphql(UPDATE_METAFIELD_MUTATION, {
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
