export function ErrorView({
  errorMsg,
  result,
  amountToSend,
  onRetry,
  onReset,
}) {
  return (
    <s-stack gap="large" justifyContent="center" alignItems="center">
      {/* ERROR ICON */}
      <s-box inlineSize="40%" blockSize="40%">
        <s-image
          src="https://cdn-icons-png.flaticon.com/128/16206/16206622.png"
          alt="Error"
          objectFit="cover"
        />
      </s-box>

      {/* HEADING */}

      {/* DESCRIPTION */}
      <s-stack
        justifyContent="center"
        alignItems="center"
        alignContent="center"
      >
        <s-heading>Payment Failed</s-heading>
        <s-text>
          {errorMsg ||
            "The transaction could not be completed. Please try again."}
        </s-text>
      </s-stack>

      {/* OPTIONAL DETAILS */}
      {result && (
        <s-section heading="Transaction details">
          <s-stack gap="small">
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
      )}

      {/* ACTIONS */}
      <s-stack gap="small" justifyContent="center" inlineSize="50%">
        <s-button variant="primary" onClick={onRetry}>
          Retry — £{amountToSend.toFixed(2)}
        </s-button>

        <s-button onClick={onReset}>Start over</s-button>
      </s-stack>
    </s-stack>
  );
}
