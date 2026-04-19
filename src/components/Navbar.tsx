"use client";

import { UserButton } from "@clerk/nextjs";
import MobileMenu from "./MobileMenu";
import { MessageCircle, Bell, Search } from "lucide-react"; // Swapped Image for Lucide icons for consistency
import { useEffect, useState } from "react";
import Image from "next/image";
import Pusher from "pusher-js";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { markMessagesAsRead } from "@/lib/actions";

interface NavbarProps {
  role: string;
  firstName: string | null | undefined;
  announcementCount: number;
  currentUserId: string;
  messageCount: number;
}

const Navbar = ({
  role,
  firstName,
  announcementCount,
  currentUserId,
  messageCount
}: NavbarProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // Local state for live updates
  const [announcementNotify, setAnnouncementNotify] = useState(announcementCount);
  const [messageNotify, setMessageNotify] = useState(messageCount);

  // Keep state in sync if server props change (e.g., on manual page refresh)
  useEffect(() => {
    setAnnouncementNotify(announcementCount);
    setMessageNotify(messageCount);
  }, [announcementCount, messageCount]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMessageClick = async () => {
    setMessageNotify(0); // Optimistic UI update
    if (currentUserId) {
      try {
        await markMessagesAsRead(currentUserId);
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    }
    router.push("/list/messages");
  };

  useEffect(() => {
    if (!currentUserId || !isMounted) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    

    // --- CHANNEL 1: PUBLIC ANNOUNCEMENTS ---
    // Note: If you want class-specific Pusher notifications, you'd subscribe to `class-${userClassId}`
    const announcementChannel = pusherClient.subscribe("announcements-channel");
    announcementChannel.bind("new-announcement", (data: { title: string }) => {
      setAnnouncementNotify((prev) => prev + 1);
      toast.success(`Announcement: ${data.title}`, {
        duration: 5000,
        icon: '📢',
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '12px' },
      });
    });

    // --- CHANNEL 2: PRIVATE MESSAGES ---
    const chatChannel = pusherClient.subscribe(`chat-${currentUserId}`);
    chatChannel.bind("new-reply", (data: { content: string; senderName?: string }) => {
      setMessageNotify((prev) => prev + 1);
      toast((t) => (
        <div onClick={() => { router.push("/list/messages"); toast.dismiss(t.id); setMessageNotify(0); }} className="cursor-pointer">
          <p className="font-bold text-xs text-slate-800">{data.senderName || "New Message"}</p>
          <p className="text-[10px] text-slate-500 truncate">{data.content.substring(0, 40)}...</p>
        </div>
      ), { icon: '💬', duration: 6000, position: 'bottom-right' });
    });

    return () => {
      pusherClient.unsubscribe("announcements-channel");
      pusherClient.unsubscribe(`chat-${currentUserId}`);
      pusherClient.disconnect();
    };
  }, [currentUserId, router, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <Toaster position="top-right" />

      {/* LEFT: MOBILE MENU & SEARCH */}
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <MobileMenu role={role} />
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-slate-200 px-3 py-2 focus-within:ring-blue-400 transition-all bg-slate-50/50">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-[200px] bg-transparent outline-none text-slate-600" 
          />
        </div>
      </div>

      {/* RIGHT: ICONS & USER */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Messages Icon */}
        <div onClick={handleMessageClick} className="group relative bg-slate-50 p-2.5 rounded-full hover:bg-blue-50 transition-all cursor-pointer border border-slate-100">
          <MessageCircle size={18} className="text-slate-500 group-hover:text-blue-600" />
          {messageNotify > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-blue-600 text-white rounded-full text-[9px] font-black border-2 border-white animate-pulse">
              {messageNotify}
            </div>
          )}
        </div>

        {/* Announcements Icon */}
        <div onClick={() => router.push("/list/announcements")} className="group relative bg-slate-50 p-2.5 rounded-full hover:bg-yellow-50 transition-all cursor-pointer border border-slate-100">
          <Bell size={18} className="text-slate-500 group-hover:text-yellow-600" />
          {announcementNotify > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-rose-500 text-white rounded-full text-[9px] font-black border-2 border-white">
              {announcementNotify}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l pl-4 border-slate-200 ml-1">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-bold text-slate-800 leading-tight">{firstName || "User"}</span>
            <span className="text-[9px] uppercase font-black text-blue-600 tracking-tighter">{role}</span>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border border-slate-200 shadow-sm" } }} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;