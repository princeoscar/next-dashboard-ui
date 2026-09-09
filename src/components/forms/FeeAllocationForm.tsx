"use client";

import { useState } from "react";
import { updateAllocation } from "@/app/(dashboard)/admin/finance/allocate/actions";


interface Props {
  allocation: any;
}

export default function FeeAllocationForm({
  allocation,
}: Props) {
  const [amount, setAmount] = useState(
    Number(allocation.amount)
  );

  const [dueDate, setDueDate] = useState(
    allocation.dueDate
      ? new Date(allocation.dueDate)
          .toISOString()
          .split("T")[0]
      : ""
  );

  return (
    <form
  action={updateAllocation.bind(null, allocation.id)}
>
      <div>

        <label className="block text-sm font-semibold mb-2">
          Amount
        </label>

        <input
          type="number"
          name="amount"
          value={amount}
          onChange={(e) =>
            setAmount(Number(e.target.value))
          }
          className="w-full rounded-xl border p-3"
        />

      </div>

      <div>

        <label className="block text-sm font-semibold mb-2">
          Due Date
        </label>

        <input
          type="date"
          name="dueDate"
          value={dueDate}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
          className="w-full rounded-xl border p-3"
        />

      </div>

      <button
        className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white"
      >
        Save Changes
      </button>

    </form>
  );
}