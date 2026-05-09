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
  try {
    // TEMP: API disabled for testing
    // const res = await fetch("/api/viva-payment", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ amountInCents, cashRegisterId, merchantRef }),
    // });

    // if (!res.ok) {
    //   const err = await res.json().catch(() => ({
    //     error: `HTTP ${res.status}`,
    //   }));
    //   throw new Error(err.error ?? "Payment request failed");
    // }

    // return res.json();

    // Dummy response after 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const response = {
      ok: true,
      status: "approved",
      transactionId: "TXN_TEST_123456",
      sessionId: "SESSION_TEST_789",
      merchantRef,
      amount: amountInCents,
      currency: "978",
      message: "Payment successful",
      timestamp: new Date().toISOString(),
    };

    // // SAVE TO SHOPIFY CART ATTRIBUTES
    // await shopify.cart.addCartProperties({
    //   merchantRef: response.merchantRef,
    //   vivaReferenceId: response.transactionId,
    // });

    return response;
  } catch (err) {
    console.error("Viva payment error:", err);

    return {
      ok: false,
      status: "failed",
      message: err.message || "Payment failed",
    };
  }
}

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { cart, toast } = shopify;

  const subtotal = 100;

  const [view, setView] = useState("form");
  const [paymentType, setPaymentType] = useState("full");
  const [customAmount, setCustomAmount] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  if (view === "pending") {
    return (
      <s-page heading="Viva Terminal Payment">
        <s-box
          padding="base"
          alignItems="center"
          justifyContent="center"
          blockSize="fill"
        >
          <PendingView amountToSend={amountToSend} />
        </s-box>
      </s-page>
    );
  }

  if (view === "success") {
    return (
      <s-page heading="Viva Terminal Payment">
        <s-box
          padding="base"
          alignItems="center"
          justifyContent="center"
          blockSize="fill"
        >
          <SuccessView
            result={result}
            amountToSend={amountToSend}
            merchantRef={merchantRef}
            paymentType={paymentType}
            remainingAmount={remainingAmount}
            onReset={handleReset}
          />
        </s-box>
      </s-page>
    );
  }

  if (view === "error") {
    return (
      <s-page heading="Viva Terminal Payment">
        <s-box
          padding="base"
          alignItems="center"
          justifyContent="center"
          blockSize="fill"
        >
          <ErrorView
            errorMsg={errorMsg}
            result={result}
            amountToSend={amountToSend}
            onRetry={handleSend}
            onReset={handleReset}
          />
        </s-box>
      </s-page>
    );
  }

  return (
    <s-page heading="Viva Terminal Payment">
      <s-stack
        justifyContent="center"
        alignItems="center"
        blockSize="100%"
        direction="block"
      >
        <s-scroll-box inlineSize="70%">
          <s-box padding="base" alignItems="center" justifyContent="center">
            <s-stack gap="large">
              <s-stack direction="inline" alignItems="center" gap="base">
                <s-box inlineSize="56px" blockSize="56px">
                  <s-image
                    src="https://cdn-icons-png.flaticon.com/128/8983/8983163.png"
                    alt="Terminal"
                  />
                </s-box>

                <s-stack>
                  <s-text fontWeight="bold">Viva Card Terminal 💳</s-text>
                  <s-text tone="subdued" variant="bodySm">
                    Terminal is online and ready to take payment
                  </s-text>
                </s-stack>
              </s-stack>

              <s-section heading="Order summary">
                <s-stack gap="small">
                  <s-stack direction="inline" justifyContent="space-between">
                    <s-text tone="subdued">Cart total</s-text>
                    <s-text>£{subtotal.toFixed(2)}</s-text>
                  </s-stack>
                </s-stack>
              </s-section>

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

              <s-button
                variant="primary"
                disabled={!canSubmit}
                onClick={handleSend}
              >
                Send £{amountToSend > 0 ? amountToSend.toFixed(2) : "—"} to Viva
                terminal
              </s-button>
            </s-stack>
          </s-box>
        </s-scroll-box>
      </s-stack>
    </s-page>
  );
}
