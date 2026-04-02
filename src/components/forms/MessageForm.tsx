"use client";

import { createMessage } from "@/lib/actions";
 // You'll need to create this Server Action
import { useFormState } from "react-dom";

const MessageForm = ({ type, data, setOpen, relatedData }: any) => {
  const [state, formAction] = useFormState(createMessage, { success: false, error: false });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Send a New Message</h1>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Recipient</label>
        <select name="receiverId" className="p-2 border rounded-md text-sm">
           {/* Map through your relatedData.teachers/students here */}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Message</label>
        <textarea name="text" className="p-2 border rounded-md text-sm" rows={4} />
      </div>

      <button className="bg-indigo-600 text-white p-2 rounded-md">
        {type === "create" ? "Send Message" : "Update Message"}
      </button>
    </form>
  );
};

export default MessageForm;