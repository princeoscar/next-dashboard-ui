"use client";

import { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// 1. Unified Type: Uses username for sender and receiver to match your DB
type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    sender: { select: { username: true; img: true } }; 
    receiver: { select: { username: true; img: true } }; 
  };
}>;

const MessageListClient = ({
  initialMessages,
  currentUserId,
}: {
  initialMessages: MessageWithRelations[]; 
  currentUserId: string;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = initialMessages.filter((msg) => {
    // Identify the "other person" in the conversation
    const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
    
    // Use username since name/surname don't exist in your model
    const displayName = (otherUser as any).username?.toLowerCase() || "";
    const content = msg.content?.toLowerCase() ?? "";

    return (
      displayName.includes(searchTerm.toLowerCase()) ||
      content.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 min-h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Messages</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] pl-4">
            Academic Network & Correspondence
          </p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by username or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      {/* MESSAGE LIST */}
      <div className="grid gap-3">
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const otherPerson = isMe ? msg.receiver : msg.sender;
          // Safely access username
          const otherName = (otherPerson as any).username || "User";

          return (
            <Link
              href={`/list/messages/${msg.id}`}
              key={msg.id}
              className={`flex items-center gap-5 p-6 rounded-3xl border border-transparent transition-all duration-300 hover:border-slate-100 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-200/20 ${
                !msg.isRead ? "bg-indigo-50/30 border-indigo-100/50" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-[50px] h-[50px] rounded-2xl overflow-hidden ring-2 ring-white shadow-sm bg-slate-100">
                  <Image
                    src={otherPerson.img || "/noAvatar.png"}
                    alt={otherName}
                    width={50}
                    height={50}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold truncate ${!msg.isRead ? "text-indigo-900" : "text-slate-700"}`}>
                    {isMe ? `To: ${otherName}` : otherName}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm truncate ${!msg.isRead ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                  {msg.content}
                </p>
              </div>
              {!msg.isRead && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200 shrink-0" />}
            </Link>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <MoreHorizontal className="text-slate-200 animate-pulse mb-4" size={48} />
          <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">No Results Found</h3>
        </div>
      )}
    </div>
  );
};

export default MessageListClient;