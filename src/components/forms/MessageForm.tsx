"use client";

import { useActionState } from "react"; // Changed from useFormState

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createMessage } from "@/lib/actions";

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Renamed hook and updated import
  const [state, formAction, isPending] = useActionState(createMessage, {
    success: false,
    error: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen]);

  const { receivers } = relatedData || {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Send a New Message" : "Edit Message"}
      </h1>

      <div className="flex flex-col gap-2">
  <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">
    Select Recipient
  </label>
  <select
    name="receiverId"
    className="ring-[1.5px] ring-slate-200 p-3 rounded-xl text-sm w-full bg-slate-50 focus:ring-rubixSky outline-none transition-all"
    defaultValue={data?.receiverId || ""}
    required
  >
    <option value="" disabled>Choose a person...</option>
    {receivers?.map((receiver: { id: string; username: string }) => (
  <option key={receiver.id} value={receiver.id}>
    {receiver.username} {/* Changed from .name to .username to match your fetch */}
  </option>
))}
  </select>
</div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Message Content</label>
        <textarea
          name="content"
          defaultValue={data?.content || ""}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
          required
        />
      </div>

      {state.error && (
        <span className="text-red-500 text-xs">Something went wrong!</span>
      )}

      <button
        disabled={isPending}
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : type === "create" ? "Send" : "Update"}
      </button>
    </form>
  );
};

export default MessageForm;