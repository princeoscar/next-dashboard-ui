"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/server-actions";
import { Send } from "lucide-react";

type ReplyBoxProps = {
  receiverTeacherId: string | null;
  receiverParentId: string | null;
};

export const ReplyBox = ({
  receiverTeacherId,
  receiverParentId,
}: ReplyBoxProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
     const formData = new FormData();

formData.append("content", text);
formData.append("subject", "Reply");

if (receiverTeacherId) {
  formData.append("receiverTeacherId", receiverTeacherId);
}

if (receiverParentId) {
  formData.append("receiverParentId", receiverParentId);
}

await sendMessage(formData);


      setText(""); // Clear input on success
      alert("Message sent!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-50">
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reply..."
          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none min-h-[120px]"
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Press send to deliver securely
          </p>
          <button
            onClick={handleSend}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Sending..." : "Send Reply"}
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};