// src/components/Finance/ReminderButton.tsx
"use client";

import { useState } from "react";
import { sendPaymentReminder } from "@/lib/actions/reminders";

interface ReminderButtonProps {
  studentBalanceId: number;
}

export default function ReminderButton({ studentBalanceId }: ReminderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReminderClick = async () => {
    setLoading(true);
    try {
      const response = await sendPaymentReminder(studentBalanceId);
      if (response.success) {
        alert(response.message || "Reminder sent out successfully!");
      } else {
        alert(response.error || "Could not process reminder rules.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while processing the notification request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReminderClick}
      disabled={loading}
      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
    >
      {loading ? "Sending..." : "Ping Parent"}
    </button>
  );
}