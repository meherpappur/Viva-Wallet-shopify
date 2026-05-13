import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useMemo, useState, useCallback } from "preact/hooks";
import { PendingView } from "./components/Pending.jsx";
import { SuccessView } from "./components/Success.jsx";
import { ErrorView } from "./components/Error.jsx";

async function requestVivaPayment({ amountInCents }) {
  try {
    const res = await fetch(
      "https://viva-wallet-shopify.onrender.com/api/viva-sale",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({
        error: `HTTP ${res.status}`,
      }));
      throw new Error(err?.error || err?.message || "Payment request failed");
    }

    return await res.json();
  } catch (err) {
    console.error("Viva payment error:", err);
    return {
      success: false,
      error: err?.message || "Payment failed",
    };
  }
}

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { cart, toast } = shopify;
  const orderTotal = Number(cart.current.value?.grandTotal ?? 0);
  shopify.cart.addCartProperties({
    vivaReferenceId: "123456",
  });
  const [view, setView] = useState("form");
  const [paymentType, setPaymentType] = useState("full");
  const [cashAmount, setCashAmount] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const cashValue = useMemo(() => {
    const n = parseFloat(cashAmount);
    return isNaN(n) || n < 0 ? 0 : n;
  }, [cashAmount]);

  const amountToSend = useMemo(() => {
    if (paymentType === "full") return orderTotal;
    return Math.max(orderTotal - cashValue, 0);
  }, [paymentType, cashValue, orderTotal]);

  const cashError = useMemo(() => {
    if (paymentType !== "custom") return "";
    if (!cashAmount) return "";
    const n = parseFloat(cashAmount);
    if (isNaN(n) || n <= 0) return "Enter a cash amount greater than £0"; // ✅
    if (n >= orderTotal)
      return `Cash must be less than £${orderTotal.toFixed(2)}`;
    return "";
  }, [paymentType, cashAmount, orderTotal]);

  const canSubmit = useMemo(() => {
    if (paymentType === "full") return orderTotal > 0;
    return cashValue > 0 && !cashError && amountToSend > 0; // ✅
  }, [paymentType, orderTotal, cashValue, cashError, amountToSend]);

  const handleSend = useCallback(async () => {
    if (!canSubmit) return;

    setView("pending");
    setErrorMsg("");

    try {
      const data = await requestVivaPayment({
        amountInCents: Math.round(amountToSend * 100),
      });
      console.log("data", data);
      setResult(data);

      if (data.success) {
        setView("success");

        const txn = data.payment.data;

        try {
          await shopify.cart.addCartProperties({
            vivaReferenceId: txn?.transactionId ?? "",
            applicationLabel: txn?.applicationLabel ?? "",
          });
        } catch (err) {
          console.error("addCartProperties failed", err);
        }

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
    setCashAmount("");
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
            remainingAmount={amountToSend}
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
                    <s-text>£{orderTotal.toFixed(2)}</s-text>
                  </s-stack>
                </s-stack>
              </s-section>

              <s-section heading="Payment amount">
                <s-stack gap="base">
                  <s-choice-list
                    values={[paymentType]}
                    onChange={(e) => {
                      setPaymentType(e?.currentTarget?.values[0] ?? "full");
                      setCashAmount("");
                    }}
                  >
                    <s-choice value="full">
                      Charge full amount — £{orderTotal.toFixed(2)}
                    </s-choice>
                    <s-choice value="custom">
                      Split payment (cash + card)
                    </s-choice>
                  </s-choice-list>

                  {paymentType === "custom" && (
                    <s-stack gap="small">
                      <s-number-field
                        label="Cash in hand (£)"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={cashAmount}
                        min="0"
                        step="0.01"
                        error={cashError || undefined}
                        onChange={(e) => setCashAmount(e.currentTarget.value)}
                      />

                      {!cashError && cashValue > 0 && (
                        <s-stack
                          direction="inline"
                          justifyContent="space-between"
                        >
                          <s-text tone="subdued">
                            Remaining to charge to card
                          </s-text>
                          <s-text tone="info">
                            £{amountToSend.toFixed(2)}
                          </s-text>
                        </s-stack>
                      )}
                    </s-stack>
                  )}
                </s-stack>
              </s-section>

              <s-section>
                <s-stack gap="small">
                  {paymentType === "custom" && cashValue > 0 && (
                    <s-stack direction="inline" justifyContent="space-between">
                      <s-text tone="subdued">Cash</s-text>
                      <s-text>£{cashValue.toFixed(2)}</s-text>
                    </s-stack>
                  )}
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
