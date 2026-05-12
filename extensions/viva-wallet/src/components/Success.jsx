export function SuccessView({
  result,
  amountToSend,
  merchantRef,
  paymentType,
  remainingAmount,
  onReset,
}) {
  return (
    <s-stack
      gap="large"
      justifyContent="center"
      alignItems="center"
      inlineSize="100%"
    >
      {/* SUCCESS ICON */}
      <s-stack
        inlineSize="96px"
        blockSize="96px"
        alignItems="center"
        justifyContent="center"
      >
        <s-image
          src="https://cdn-icons-png.flaticon.com/128/14090/14090371.png"
          alt="Payment successful"
          objectFit="cover"
        />
      </s-stack>

      {/* TITLE + MESSAGE */}
      <s-stack gap="small" alignItems="center">
        <s-heading>Payment Successful 🎉</s-heading>

        <s-text style={{ textAlign: "center", opacity: 0.8 }}>
          Transaction completed successfully
        </s-text>
      </s-stack>

      {/* KEY INFO */}
      <s-stack inlineSize="50%">
        <s-section heading="Transaction details">
          <s-stack gap="base" paddingBlockStart="base">
            {/* AMOUNT */}
            <s-stack direction="inline" justifyContent="space-between">
              <s-text>Amount charged</s-text>
              <s-text>£{Number(amountToSend || result?.amount)}</s-text>
            </s-stack>

            {/* PAYMENT TYPE */}
            {paymentType && (
              <s-stack direction="inline" justifyContent="space-between">
                <s-text>Payment type</s-text>
                <s-text>{paymentType}</s-text>
              </s-stack>
            )}

            {/* MERCHANT REF */}
            {merchantRef && (
              <s-stack direction="inline" justifyContent="space-between">
                <s-text>Reference</s-text>
                <s-text>{merchantRef}</s-text>
              </s-stack>
            )}

            {/* SESSION */}
            {result?.sessionId && (
              <s-stack direction="inline" justifyContent="space-between">
                <s-text>Session ID</s-text>
                <s-text>{result.sessionId}</s-text>
              </s-stack>
            )}

            {/* REMAINING AMOUNT (if partial payment) */}
            {remainingAmount > 0 && (
              <s-stack direction="inline" justifyContent="space-between">
                <s-text>Remaining</s-text>
                <s-text>£{remainingAmount}</s-text>
              </s-stack>
            )}
          </s-stack>
        </s-section>
      </s-stack>

      {/* ACTION */}
      <s-box inlineSize="50%" alignItems="center">
        <s-button
          variant="primary"
          onClick={() => window.close()}
          inlineSize="100%"
        >
          Done
        </s-button>
      </s-box>
    </s-stack>
  );
}
