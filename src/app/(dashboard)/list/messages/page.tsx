"use client";

import { useState } from "react";
import { Search, MoreHorizontal, Filter, MessageSquarePlus } from "lucide-react";
import Image from "next/image";
import FormContainer from "@/components/FormContainer";
import Link from "next/link";

// 1. DEFINE TYPES FOR BETTER DEVELOPER EXPERIENCE
interface MessagePreview {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isRead: boolean;
  online: boolean;
}

const mockMessages: MessagePreview[] = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    avatar: "/teacher1.png",
    lastMessage: "The Physics lab report is due by Friday evening.",
    time: "10:24 AM",
    isRead: false,
    online: true,
  },
  {
    id: 2,
    name: "James Wilson (Grade 10-A)",
    avatar: "/student1.png",
    lastMessage: "Thank you for the feedback on my math assignment!",
    time: "Yesterday",
    isRead: true,
    online: false,
  },
  {
    id: 3,
    name: "School Administration",
    avatar: "/admin.png",
    lastMessage: "Reminder: Parent-Teacher meeting this Saturday.",
    time: "Oct 24",
    isRead: true,
    online: true,
  },
];

const MessageListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // 2. FILTER LOGIC FOR SEARCH
  const filteredMessages = mockMessages.filter((msg) =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 min-h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER & ACTIONS */}
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

        <div className="flex items-center gap-3">
          <button className="group p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md hover:text-indigo-600 transition-all duration-300">
            <Filter size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          {/* Using a custom Icon wrapper for the FormContainer if needed */}
          <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
             <FormContainer table="message" type="create" />
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-[6px] focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* MESSAGE LIST */}
      <div className="grid gap-3">
        {filteredMessages.map((msg) => (
          <Link
            href={`/list/messages/${msg.id}`}
            key={msg.id}
            className={`flex items-center gap-5 p-6 rounded-3xl border border-transparent transition-all duration-300 hover:border-slate-100 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-200/20 ${
              !msg.isRead ? "bg-indigo-50/30 border-indigo-100/50" : ""
            }`}
          >
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-[50px] h-[50px] rounded-2xl overflow-hidden ring-2 ring-white shadow-sm bg-slate-100">
                <Image 
                    src={msg.avatar} 
                    alt={msg.name} 
                    width={50} 
                    height={50} 
                    className="object-cover w-full h-full" 
                />
              </div>
              {msg.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold truncate ${!msg.isRead ? "text-indigo-900" : "text-slate-700"}`}>
                  {msg.name}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {msg.time}
                </span>
              </div>
              <p className={`text-sm truncate ${!msg.isRead ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                {msg.lastMessage}
              </p>
            </div>

            {/* Unread Indicator */}
            {!msg.isRead && (
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200 shrink-0" />
            )}
          </Link>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
            <MoreHorizontal className="text-slate-200 animate-pulse" size={48} />
          </div>
          <div className="text-center">
             <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-1">No Results Found</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                Try adjusting your search criteria
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageListPage;