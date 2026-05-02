"use client";

import Announcements from "@/components/Announcements";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import Image from "next/image";
import React, { useState } from "react";
import { MessageSquare, Send, Calendar, CheckCircle2, AlertCircle } from "lucide-react"; 
import { createAnnouncement, sendReplyMessage, createEvent } from "@/lib/actions";
import { toast } from "react-toastify";

interface AdminClientProps {
  counts: {
    studentCount: number;
    teacherCount: number;
    parentCount: number;
    adminCount: number;
    announcementCount: number;
    msgCount: number;
    attendanceOversight: any[]; // Data is coming through here
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
  const [isPostMode, setIsPostMode] = useState(false);
  const [isEventMode, setIsEventMode] = useState(false);

  // 🎯 Use the prop from counts
  const pending = counts?.attendanceOversight || [];

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
    <div className="flex flex-col gap-4 lg:flex-row p-4">
      {/* LEFT SIDE - Analytics & Oversight */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" count={counts?.adminCount || 0} />
          <UserCard type="teacher" count={counts?.teacherCount || 0} />
          <UserCard type="student" count={counts?.studentCount || 0} />
          <UserCard type="parent" count={counts?.parentCount || 0} />
        </div>

        {/* ATTENDANCE CHART & PIE CHART */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/3 h-[450px]">{chart}</div>
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-2xl p-6 shadow-sm border border-slate-50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Attendance Trends</h1>
              <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            <div className="flex-1 w-full min-h-0">{attendanceChart}</div>
          </div>
        </div>

        {/* FINANCE CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
{/* 🎯 ATTENDANCE OVERSIGHT */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                <AlertCircle size={20}/>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                Daily <span className="text-rose-500">Oversight</span>
              </h2>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {new Intl.DateTimeFormat("en-GB").format(new Date())}
            </span>
          </div>

          {pending.length === 0 ? (
            <div className="py-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <p className="text-emerald-600 text-xs font-bold uppercase italic tracking-widest">All teachers have submitted logs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {pending.map((item) => (
                <div 
                  key={`${item.subjectName}-${item.className}`} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-rose-200 hover:bg-rose-50/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-black text-slate-700 uppercase leading-none mb-1">{item.subjectName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                      {item.className} • {item.teacher ? `${item.teacher.name} ${item.teacher.surname}` : "Unassigned"}
                    </p>
                  </div>
                  <span className="text-[8px] font-black bg-white border border-rose-100 text-rose-500 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div> 
      </div>

      {/* RIGHT SIDE - Events, Inbox, Announcements */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        
        {/* EVENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
  {/* 🎯 Removed the top header div that had the "+ NEW" button and duplicated title */}

  {isEventMode ? (
    <form 
      action={async (formData) => {
        // 🎯 FIX: Pass formData directly since our action now handles it
        const res = await createEvent({ success: false, error: false }, formData);
        
        if (res.success) {
          toast.success("Event Scheduled!");
          setIsEventMode(false);
          // router.refresh(); // Recommended to refresh the calendar view
        }
      }} 
      className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2"
    >
      <input 
        name="title" 
        placeholder="Event Name" 
        className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none" 
        required 
      />
      <div className="grid grid-cols-2 gap-2">
        <input 
          name="startTime" // Changed to match your Zod schema
          type="datetime-local" 
          className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100 outline-none" 
          required 
        />
        <input 
          name="endTime" // Changed to match your Zod schema
          type="datetime-local" 
          className="bg-slate-50 p-2 rounded-lg text-[10px] border border-slate-100 outline-none" 
          required 
        />
      </div>
      <textarea 
        name="description" 
        placeholder="Event Description"
        className="w-full bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none h-20 resize-none"
      />
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all active:scale-95"
      >
        Schedule Event
      </button>
      <button 
        type="button"
        onClick={() => setIsEventMode(false)}
        className="w-full bg-slate-100 text-slate-500 font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
      >
        Cancel
      </button>
    </form>
  ) : (
    /* This will now display your calendar and messages without the extra header */
    eventList 
  )}
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
            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase tracking-widest tabular-nums">
              {messages.length} New
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedMessage?.id === message.id ? "bg-slate-900 border-slate-900 shadow-lg scale-[1.02]" : "bg-slate-50/50 border-slate-100 hover:border-blue-200"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-tight ${selectedMessage?.id === message.id ? "text-white" : "text-slate-700"}`}>
                      {message.sender.username}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold tabular-nums">
                      {new Intl.DateTimeFormat("en-GB", { hour: '2-digit', minute: '2-digit' }).format(new Date(message.createdAt))}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${selectedMessage?.id === message.id ? "text-slate-400" : "text-slate-500"}`}>
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
                <button onClick={() => setSelectedMessage(null)} className="text-[10px] font-bold text-slate-300 hover:text-rose-500 uppercase transition-colors">Cancel</button>
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
                  className={`absolute bottom-2 right-2 p-2 rounded-lg transition-all ${isSending ? "bg-slate-400" : "bg-blue-500 hover:bg-blue-600 shadow-md active:scale-90"} text-white`}
                >
                  <Send size={14} className={isSending ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ANNOUNCEMENTS SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          {/* <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">News Flash</h1>
            <button 
              onClick={() => setIsPostMode(!isPostMode)}
              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all ${
                isPostMode ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-600"
              }`}
            >
              {isPostMode ? "Cancel" : "+ Post"}
            </button>
          </div> */}

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
              <input name="title" placeholder="Headline" className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none" required />
              <textarea name="description" placeholder="Write announcement content here..." className="bg-slate-50 p-3 rounded-xl text-xs border border-slate-100 outline-none min-h-[100px] resize-none" required />
              <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-700 transition-all shadow-md active:scale-95">Publish to School</button>
            </form>
          ) : (
            <Announcements data={announcements} />
          )}
        </div>
      </div>
    </div>
  )
};

export default AdminClientPage;