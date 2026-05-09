import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useMemo, useState, useCallback } from "preact/hooks";
import { PendingView } from "./components/Pending.jsx";
import { SuccessView } from "./components/Success.jsx";
import { ErrorView } from "./components/Error.jsx";
async function requestVivaPayment({
  amountInCents,
  cashRegisterId,
  merchantRef,
}) {
  const res = await fetch("/api/viva-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amountInCents, cashRegisterId, merchantRef }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? "Payment request failed");
  }
  return res.json();
  // Expected shape: { ok, transactionId, amount, message, sessionId }
}

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { cart, toast } = shopify;

  // const subtotal = Number(cart.current.value?.subtotal ?? 0);
  const subtotal = 100;
  // ── state ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState("success"); // form | pending | success | error
  const [paymentType, setPaymentType] = useState("full");
  const [customAmount, setCustomAmount] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [result, setResult] = useState(null); // last API response
  const [errorMsg, setErrorMsg] = useState("");

  // ── derived ────────────────────────────────────────────────────────────────
  const amountToSend = useMemo(() => {
    if (paymentType === "full") return subtotal;
    const n = parseFloat(customAmount);
    return isNaN(n) ? 0 : n;
  }, [paymentType, customAmount, subtotal]);

  const remainingAmount = Math.max(subtotal - amountToSend, 0);

  const amountError = useMemo(() => {
    if (paymentType !== "custom") return "";
    if (!customAmount) return "";
    const n = parseFloat(customAmount);
    if (isNaN(n) || n <= 0) return "Enter an amount greater than £0";
    if (n > subtotal)
      return `Cannot exceed cart total of £${subtotal.toFixed(2)}`;
    return "";
  }, [paymentType, customAmount, subtotal]);

  const canSubmit = amountToSend > 0 && !amountError;

  // ── handlers ───────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!canSubmit) return;

    setView("pending");
    setErrorMsg("");

    try {
      const data = await requestVivaPayment({
        amountInCents: Math.round(amountToSend * 100),
        cashRegisterId: "ECR-001",
        merchantRef,
      });

      setResult(data);

      if (data.ok) {
        setView("success");
        toast.show(`Payment approved — £${amountToSend.toFixed(2)}`);
      } else {
        setErrorMsg(data.message ?? "Payment declined");
        setView("error");
      }
    } catch (err) {
      setErrorMsg(err.message ?? "Unexpected error");
      setView("error");
    }
  }, [canSubmit, amountToSend, merchantRef, toast]);

  const handleReset = useCallback(() => {
    setView("form");
    setPaymentType("full");
    setCustomAmount("");
    setMerchantRef("");
    setResult(null);
    setErrorMsg("");
  }, []);
  return (
    <s-page heading="Viva Terminal Payment">
      <s-scroll-box>
        <s-box padding="base">
          {/* ── FORM VIEW ─────────────────────────────────────────────── */}
          {view === "form" && (
            <s-stack gap="large">
              {/* Terminal badge */}
              <s-stack direction="inline" gap="small" align-items="center">
                <s-icon name="payment-terminal" />
                <s-text tone="subdued">Viva card machine ready</s-text>
                <s-badge tone="success">Online</s-badge>
              </s-stack>

              {/* Order summary card */}
              <s-section heading="Order summary">
                <s-stack gap="small">
                  <s-stack direction="inline" justifyContent="space-between">
                    <s-text tone="subdued">Cart total</s-text>
                    <s-text>£{subtotal.toFixed(2)}</s-text>
                  </s-stack>
                </s-stack>
              </s-section>

              {/* Payment type */}
              <s-section heading="Payment amount">
                <s-stack gap="base">
                  <s-choice-list
                    values={[paymentType]}
                    onChange={(e) => {
                      setPaymentType(e?.currentTarget?.values[0] ?? "full");
                      setCustomAmount("");
                    }}
                  >
                    <s-choice value="full">
                      Charge full amount — £{subtotal.toFixed(2)}
                    </s-choice>
                    <s-choice value="custom">Split / custom amount</s-choice>
                  </s-choice-list>

                  {/* Custom amount input */}
                  {paymentType === "custom" && (
                    <s-stack gap="small">
                      <s-number-field
                        label="Amount to charge (£)"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={customAmount}
                        min="0.01"
                        step="0.01"
                        error={amountError || undefined}
                        onChange={(e) => setCustomAmount(e.currentTarget.value)}
                      />

                      {/* Remaining balance */}
                      {!amountError &&
                        amountToSend > 0 &&
                        amountToSend < subtotal && (
                          <s-stack
                            direction="inline"
                            justifyContent="space-between"
                          >
                            <s-text tone="subdued">Remaining balance</s-text>
                            <s-text tone="info">
                              £{remainingAmount.toFixed(2)}
                            </s-text>
                          </s-stack>
                        )}
                    </s-stack>
                  )}
                </s-stack>
              </s-section>

              {/* Charge summary */}
              <s-section>
                <s-stack gap="small">
                  <s-stack direction="inline" justifyContent="space-between">
                    <s-text>Sending to terminal</s-text>
                    <s-text>
                      £{amountToSend > 0 ? amountToSend.toFixed(2) : "0.00"}
                    </s-text>
                  </s-stack>
                </s-stack>
              </s-section>

              {/* CTA */}
              <s-button
                variant="primary"
                disabled={!canSubmit}
                onClick={handleSend}
              >
                Send £{amountToSend > 0 ? amountToSend.toFixed(2) : "—"} to Viva
                terminal
              </s-button>
            </s-stack>
          )}

          {view === "pending" && <PendingView amountToSend={amountToSend} />}

          {view === "success" && (
            <SuccessView
              result={{
                amount: 200,
              }}
            />
          )}

          {view === "error" && (
            <ErrorView
              errorMsg={errorMsg}
              result={result}
              amountToSend={amountToSend}
              onRetry={handleSend}
              onReset={handleReset}
            />
          )}
        </s-box>
      </s-scroll-box>
    </s-page>
  );
}
