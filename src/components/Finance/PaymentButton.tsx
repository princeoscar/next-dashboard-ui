// src/components/Finance/PaymentButton.tsx
"use client";

import { useState } from "react";
import { startOnlinePaymentInvoice } from "@/lib/actions/payments";

interface PaymentButtonProps {
  studentBalanceId: number;
  parentEmail: string;
}

export default function PaymentButton({ studentBalanceId, parentEmail }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePaymentClick = async () => {
    setLoading(true);
    try {
      const result = await startOnlinePaymentInvoice(studentBalanceId, parentEmail);
      
      if (result.success && result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      } else {
        alert(result.error || "Could not spin up payment session. Please try again.");
      }
    } catch (error) {
      console.error("Gateway error:", error);
      alert("An unexpected error occurred while connecting to Paystack.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePaymentClick}
      disabled={loading}
      className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl text-xs tracking-wide transition-colors shadow-sm cursor-pointer"
    >
      {loading ? "Initializing Gateway..." : "Pay Balance Online"}
    </button>
  );
}