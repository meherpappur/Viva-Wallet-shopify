export function PendingView({ amountToSend = 100 }) {
  return (
    <s-stack gap="large" alignItems="center">
      <s-box padding="loose">
        <s-stack gap="base" alignItems="center">
          <s-stack gap="small" alignItems="center">
            <s-text variant="headingMd">Waiting for card machine…</s-text>
            <s-text tone="subdued">
              Please tap, insert, or swipe the card on the terminal.
            </s-text>
          </s-stack>

          <s-section>
            <s-stack direction="inline" justifyContent="space-between">
              <s-text tone="subdued">Amount</s-text>
              <s-text variant="headingLg">£{amountToSend.toFixed(2)}</s-text>
            </s-stack>
          </s-section>

          <s-text tone="subdued" variant="bodyXs">
            Do not close this window. This may take up to 90 seconds.
          </s-text>
        </s-stack>
        <s-spinner accessibilityLabel="Loading content" />s
      </s-box>
    </s-stack>
  );
}
