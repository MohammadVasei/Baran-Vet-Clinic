import { ZarinPalCheckout } from "zarinpal-checkout";

const isSandbox = process.env.ZARINPAL_SANDBOX === "true";

function getZarinPalClient() {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("ZARINPAL_MERCHANT_ID is not set in environment variables");
  }
  return new ZarinPalCheckout(merchantId, { sandbox: isSandbox });
}

export interface PaymentRequestResult {
  authority: string;
  redirectUrl: string;
  status: number;
}

export interface PaymentVerificationResult {
  refId: string;
  cardPan: string;
  status: number;
  fee: number;
  feeType: string;
}

export async function createPaymentRequest(
  amount: number,
  description: string,
  callbackUrl: string,
  metadata?: Record<string, string>
): Promise<PaymentRequestResult> {
  try {
    const zarinpal = getZarinPalClient();
    const result = await zarinpal.PaymentRequest({
      Amount: amount,
      CallbackURL: callbackUrl,
      Description: description,
    });

    if (result.status !== 100) {
      throw new Error(`ZarinPal payment request failed: ${result.status}`);
    }

    const redirectUrl = isSandbox
      ? `https://sandbox.zarinpal.com/pg/StartPay/${result.authority}`
      : `https://www.zarinpal.com/pg/StartPay/${result.authority}`;

    return {
      authority: result.authority,
      redirectUrl,
      status: result.status,
    };
  } catch (error) {
    console.error("ZarinPal PaymentRequest error:", error);
    throw error;
  }
}

export async function verifyPayment(
  authority: string,
  amount: number
): Promise<PaymentVerificationResult> {
  try {
    const zarinpal = getZarinPalClient();
    const result = await zarinpal.PaymentVerification({
      Amount: amount,
      Authority: authority,
    });

    return {
      refId: String(result.refId || ""),
      cardPan: result.cardPan || "",
      status: result.status,
      fee: result.fee || 0,
      feeType: result.feeType || "",
    };
  } catch (error) {
    console.error("ZarinPal PaymentVerification error:", error);
    throw error;
  }
}

export function getRedirectUrl(authority: string): string {
  return isSandbox
    ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
    : `https://www.zarinpal.com/pg/StartPay/${authority}`;
}