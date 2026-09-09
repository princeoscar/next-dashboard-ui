"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { promoteAllEligibleStudents } from "@/lib/actions/promotion";

export default function PromotionButton() {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const handlePromotion = () => {
    const confirmed = window.confirm(
      "Are you sure you want to promote all eligible students?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        const result = await promoteAllEligibleStudents();

        alert(
          `Promotion Completed

Promoted: ${result.promoted}

Repeated: ${result.repeated}

Graduated: ${result.graduated}`
        );

        router.refresh();
      } catch (error) {
        console.error(error);

        alert("Promotion failed.");
      }
    });
  };

  return (
    <button
      onClick={handlePromotion}
      disabled={pending}
      className="bg-rubixPrimary text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
    >
      {pending ? "Processing..." : "Promote All Eligible Students"}
    </button>
  );
}