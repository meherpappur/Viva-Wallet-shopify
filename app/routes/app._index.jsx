
export default function Index() {
  return (
    <s-page heading="Viva POS Admin Dashboard">
      {/* MAIN STATUS CARD */}
      <s-section heading="System Status">
        <s-box
          padding="base"
          borderWidth="base"
          borderRadius="base"
          background="subdued"
        >
          <s-heading>💳 Viva EFT Integration Active</s-heading>

          <s-paragraph>
            Your system is connected and ready to process card payments via Viva
            Wallet POS terminals.
          </s-paragraph>

          <s-paragraph>
            Status: <s-text variant="strong">READY</s-text>
          </s-paragraph>
        </s-box>
      </s-section>

      {/* INFO GRID */}
      <s-section heading="Payment System Overview">
        <s-grid columns="2" gap="base">
          <s-box borderWidth="base" padding="base" borderRadius="base">
            <s-heading>⚡ Fast Processing</s-heading>
            <s-paragraph>
              Payments are processed directly via EFT POS terminals in
              real-time.
            </s-paragraph>
          </s-box>

          <s-box borderWidth="base" padding="base" borderRadius="base">
            <s-heading>🔐 Secure Transactions</s-heading>
            <s-paragraph>
              Uses Viva Wallet secure token-based authentication system.
            </s-paragraph>
          </s-box>

          <s-box borderWidth="base" padding="base" borderRadius="base">
            <s-heading>📡 Live Device Sync</s-heading>
            <s-paragraph>
              Automatically detects active POS terminals connected to merchant
              account.
            </s-paragraph>
          </s-box>

          <s-box borderWidth="base" padding="base" borderRadius="base">
            <s-heading>🧾 Session Tracking</s-heading>
            <s-paragraph>
              Every transaction is tracked using session-based polling system.
            </s-paragraph>
          </s-box>
        </s-grid>
      </s-section>

      {/* SIDE INFO */}
      <s-section slot="aside" heading="Viva System Info">
        <s-paragraph>
          Environment: <s-text variant="strong">Demo / Production Ready</s-text>
        </s-paragraph>

        <s-paragraph>
          Mode: <s-text variant="strong">EFT POS Integration</s-text>
        </s-paragraph>

        <s-paragraph>
          Status: <s-text variant="strong">ACTIVE</s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
