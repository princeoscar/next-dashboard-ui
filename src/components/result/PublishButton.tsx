"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishResults } from "@/lib/actions/result";

export default function PublishButton() {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const handlePublish = () => {
  if (
    !confirm(
      "Publish all current session results?\n\nStudents and parents will immediately be able to view them."
    )
  ) {
    return;
  }

  startTransition(async () => {
    try {
      const result = await publishResults();

      alert(result.message);

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to publish results.");
    }
  });
};

  return (
    <button
      onClick={handlePublish}
      disabled={pending}
      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold disabled:opacity-50"
    >
      {pending ? "Publishing..." : "Publish Results"}
    </button>
  );
}