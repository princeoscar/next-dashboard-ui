"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createMessage } from "@/lib/actions";
import { Send, UserPlus, MessageSquareText, AlertCircle } from "lucide-react";

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

  const { receivers = [] } = relatedData || {};

  return (
    <form 
      action={formAction} 
      className="flex flex-col gap-6 w-full max-w-xl mx-auto p-1 md:p-2"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2 border-b border-slate-100 pb-6">
        <div className="p-4 bg-rubixSky/10 text-rubixSky rounded-2xl shadow-sm">
          <Send size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
            {type === "create" ? "Direct Message" : "Edit Message"}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
            Internal Communications
          </p>
        </div>
      </div>

      {/* RECIPIENT SELECT */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <UserPlus size={12} className="text-rubixSky" />
          Choose Recipient
        </label>
        <div className="relative">
          <select
            name="receiverId"
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all appearance-none cursor-pointer"
            defaultValue={data?.receiverId || ""}
            required
          >
            <option value="" disabled>Select a contact...</option>
            {receivers.map((receiver: { id: string; username: string }) => (
              <option key={receiver.id} value={receiver.id}>
                @{receiver.username}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
             ▼
          </div>
        </div>
      </div>

      {/* MESSAGE CONTENT */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
          <MessageSquareText size={12} className="text-rubixSky" />
          Message Body
        </label>
        <textarea
          name="content"
          placeholder="Type your message here..."
          defaultValue={data?.content || ""}
          className="w-full p-4 rounded-[1.5rem] bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all min-h-[160px] resize-none shadow-inner"
          required
        />
      </div>

      {/* ERROR MESSAGE */}
      {state.error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 animate-pulse">
          <AlertCircle size={16} />
          <span className="text-[11px] font-black uppercase tracking-tight">Transmission Failed. Please try again.</span>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase italic text-center sm:text-left">
          Ensure content adheres to class policy.
        </p>
        <button
          disabled={isPending}
          className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isPending 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-slate-900 hover:bg-rubixSky text-white shadow-rubixSky/20"
          }`}
        >
          {isPending ? (
            <>
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Send size={14} />
              {type === "create" ? "Broadcast" : "Update"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;