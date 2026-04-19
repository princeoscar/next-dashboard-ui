"use client";

import Announcements from "@/components/Announcements";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import Image from "next/image";
import React, { useState } from "react";
import { MessageSquare, Send, User as UserIcon, Calendar } from "lucide-react"; 
import { createAnnouncement, sendReplyMessage, createEvent } from "@/lib/actions"; // Updated imports
import { toast } from "react-toastify";

interface AdminClientProps {
  counts: {
    studentCount: number;
    teacherCount: number;
    parentCount: number;
    adminCount: number;
  };
  searchParams: { [key: string]: string | undefined };
  announcements: any[];
  messages: {
    id: number;
    content: string;
    createdAt: Date;
    senderId: string;
    receiverId: string;
    isRead: boolean;
    readAt: Date | null;
    sender: {
      username: string;
    };
  }[];
  chart: React.ReactNode;
  attendanceChart: React.ReactNode;
  eventList: React.ReactNode;
}

const AdminClientPage = ({
  counts,
  searchParams,
  announcements = [],
  messages = [],
  chart,
  attendanceChart,
  eventList,
}: AdminClientProps) => {
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // New States for Quick Actions
  const [isPostMode, setIsPostMode] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setIsSending(true);
    const result = await sendReplyMessage(selectedMessage.senderId, replyText);
    setIsSending(false);

    if (result.success) {
      setReplyText("");
      setSelectedMessage(null);
      toast.success("Message sent successfully!");
    } else {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row p-4">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={counts?.adminCount || 0} />
          <UserCard type="teacher" count={counts?.teacherCount || 0} />
          <UserCard type="student" count={counts?.studentCount || 0} />
          <UserCard type="parent" count={counts?.parentCount || 0} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 h-[450px]">{chart}</div>
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-semibold text-slate-800">Attendance</h1>
              <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            <div className="flex-1 w-full min-h-0">{attendanceChart}</div>
          </div>
        </div>

        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        
        {/* EVENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Calendar size={20} className="text-blue-500" />
               <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Events</h1>
            </div>
            <button 
              onClick={() => setIsEventMode(!isEventMode)}
              className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-900 text-white uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              {isEventMode ? "Close" : "+ New"}
            </button>
          </div>

          {isEventMode ? (
            <form action={async (formData) => {
              const res = await createEvent({ success: false, error: false }, {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                startTime: formData.get("start") as string,
                endTime: formData.get("end") as string,
              } as any);
              if(res.success) {
                toast.success("Event Scheduled!");
                setIsEventMode(false);
              }
            }} className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
              <input name="title" placeholder="Event Name" className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-100" required />
              <div className="grid grid-cols-2 gap-2">
                <input name="start" type="datetime-local" className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100" required />
                <input name="end" type="datetime-local" className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100" required />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700">Schedule Event</button>
            </form>
          ) : eventList}
        </div>

        {/* MESSAGES HUB */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <MessageSquare size={20} />
              </div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Inbox</h1>
            </div>
            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase tracking-widest">
              {messages.length} New
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedMessage?.id === message.id ? "bg-slate-900 border-slate-900" : "bg-slate-50/50 border-slate-100 hover:border-blue-200"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMessage?.id === message.id ? "text-white" : "text-slate-700"}`}>
                      {message.sender.username}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold tabular-nums">
                      {new Intl.DateTimeFormat("en-GB", { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt))}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${selectedMessage?.id === message.id ? "text-slate-400" : "text-slate-500"}`}>
                    {message.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-20 italic text-xs">No recent messages</div>
            )}
          </div>

          {selectedMessage && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Reply to {selectedMessage.sender.username}</span>
                <button onClick={() => setSelectedMessage(null)} className="text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase">Cancel</button>
              </div>
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type response..."
                  disabled={isSending}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[80px]"
                />
                <button
                  onClick={handleSendReply}
                  disabled={isSending || !replyText.trim()}
                  className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${isSending ? "bg-slate-400" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                >
                  <Send size={14} className={isSending ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ANNOUNCEMENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Announcements</h1>
            <button 
              onClick={() => setIsPostMode(!isPostMode)}
              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all ${
                isPostMode ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isPostMode ? "Cancel" : "+ Post"}
            </button>
          </div>

          {isPostMode ? (
            <form action={async (formData) => {
              const res = await createAnnouncement({ success: false, error: false }, {
                title: formData.get("title") as string,
                description: formData.get("description") as string,
                date: new Date().toISOString()
              } as any);
              if(res.success) {
                toast.success("Announcement Posted!");
                setIsPostMode(false);
              }
            }} className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              <input name="title" placeholder="Title" className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none" required />
              <textarea name="description" placeholder="Details..." className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none min-h-[100px]" required />
              <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition-colors">Post to School</button>
            </form>
          ) : (
            <Announcements data={announcements} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClientPage;