export function PendingView({ amountToSend = 0 }) {
  return (
    <s-stack
      gap="large"
      justifyContent="center"
      alignItems="center"
      inlineSize="100%"
    >
      {/* ICON */}
      <s-stack
        inlineSize="96px"
        blockSize="96px"
        alignItems="center"
        justifyContent="center"
      >
        <s-image
          src="https://cdn-icons-png.flaticon.com/128/13455/13455433.png"
          alt="Processing payment"
          objectFit="cover"
        />
      </s-stack>

      {/* SPINNER (TOP FOCUS INDICATOR) */}
      <s-stack
        inlineSize="48px"
        blockSize="48px"
        alignItems="center"
        justifyContent="center"
      >
        <s-spinner accessibilityLabel="Processing payment" />
      </s-stack>

      {/* TITLE + MESSAGE */}
      <s-stack gap="small" alignItems="center">
        <s-heading>Processing Payment… 💳</s-heading>

        <s-text style={{ textAlign: "center", opacity: 0.8 }}>
          Please follow instructions on the card machine 📟
        </s-text>
      </s-stack>

      {/* DETAILS */}
      <s-stack inlineSize="50%">
        <s-section heading="Transaction details" inlineSize="100%">
          <s-stack gap="base" inlineSize="100%" paddingBlockStart="base">
            <s-stack direction="inline" justifyContent="space-between">
              <s-text>Amount</s-text>
              <s-text variant="headingLg">
                £{Number(amountToSend || 0).toFixed(2)}
              </s-text>
            </s-stack>
          </s-stack>
        </s-section>
      </s-stack>

      {/* FOOTER NOTE */}
      <s-stack alignItems="center" justifyContent="center">
        <s-box inlineSize="50%">
          <s-text
            tone="subdued"
            variant="bodySm"
            style={{ textAlign: "center" }}
          >
            Do not close this screen until the transaction completes ⏳
          </s-text>
        </s-box>
      </s-stack>
    </s-stack>
  );
}
