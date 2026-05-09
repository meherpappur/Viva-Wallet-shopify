export function SuccessView() {
  const result = {
    amount: 2599, // demo amount in cents
  };

  return (
    <s-stack gap="base">
      {/* SUCCESS ICON */}
      <s-stack inlineSize="40%" blockSize="40%">
        <s-image
          src="https://cdn-icons-png.flaticon.com/128/14090/14090371.png"
          alt="Success"
        />
      </s-stack>

      {/* HEADING + DESCRIPTION */}
      <s-stack alignItems="center">
        <s-heading>Payment Successful 🎉</s-heading>

        <s-text>Your transaction has been completed successfully.</s-text>
      </s-stack>

      {/* DETAILS */}
      <s-section heading="Transaction details">
        <s-stack direction="inline" justifyContent="space-between">
          <s-text>Amount charged</s-text>
          <s-text>£{(result.amount / 100).toFixed(2)}</s-text>
        </s-stack>
      </s-section>

      {/* ACTION */}
      <s-button variant="primary">Done</s-button>
    </s-stack>
  );
}
