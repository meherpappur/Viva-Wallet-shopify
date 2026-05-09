export function ErrorView({
  errorMsg,
  result,
  amountToSend,
  onRetry,
  onReset,
}) {
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
          src="https://cdn-icons-png.flaticon.com/128/16206/16206622.png"
          alt="Payment failed"
          objectFit="cover"
        />
      </s-stack>

      {/* TITLE + MESSAGE */}
      <s-stack gap="small" alignItems="center">
        <s-heading>Payment Failed ❌</s-heading>

        <s-text style={{ textAlign: "center", opacity: 0.8 }}>
          {errorMsg ||
            "The transaction could not be completed. Please try again."}
        </s-text>
      </s-stack>

      {/* DETAILS */}
      {result && (
        <s-stack inlineSize="50%">
          <s-section heading="Transaction details" inlineSize="100%">
            <s-stack gap="base" inlineSize="100%" paddingBlockStart="base">
              {result.sessionId && (
                <s-stack direction="inline" justifyContent="space-between">
                  <s-text>Session ID</s-text>
                  <s-text>{result.sessionId}</s-text>
                </s-stack>
              )}

              {result.message && (
                <s-stack direction="inline" justifyContent="space-between">
                  <s-text>Reason</s-text>
                  <s-text>{result.message}</s-text>
                </s-stack>
              )}
            </s-stack>
          </s-section>
        </s-stack>
      )}

      {/* ACTIONS */}
      <s-box gap="small" inlineSize="50%">
        <s-stack gap="base">
          <s-button variant="primary" onClick={onRetry}>
            Retry — £{Number(amountToSend).toFixed(2)}
          </s-button>

          <s-button onClick={onReset}>Start over</s-button>
        </s-stack>
      </s-box>
    </s-stack>
  );
}
