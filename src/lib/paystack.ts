// src/lib/paystack.ts

interface InitializeParam {
  email: string;
  amount: number; // Stored natively as raw un-multiplied main fiat unit
  reference: string;
  callback_url: string;
  metadata: {
    studentBalanceId: number;
    studentId: string;
  };
}

export async function initializePaystackTransaction(params: InitializeParam) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("Missing system environment variable: PAYSTACK_SECRET_KEY");

  // Paystack processes all monetary units in base kobo amounts (fiat value multiplied by 100)
  const convertedAmountInKobo = Math.round(params.amount * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: convertedAmountInKobo,
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  });

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || "Failed to initialize standard authorization link.");
  }

  return data.data; // Yields standard authorization_url and checkout reference parameters
}