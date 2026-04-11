"use client"

import {prisma} from "@/lib/prisma";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import MobileMenu from "./MobileMenu";
import { Search, MessageCircle, Bell } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = ({ role, firstName, announcementCount }: { 
  role: string, 
  firstName: string | null | undefined, 
  announcementCount: number 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      
      {/* 1. LEFT: MOBILE MENU (The Graduation Cap) */}
      <div className="md:hidden flex items-center">
        <MobileMenu role={role} />
      </div>

      {/* 2. MIDDLE: SEARCH BAR (Grows to fill space) */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-200 px-3 py-1.5 bg-slate-50 ml-4 flex-1 max-w-md focus-within:ring-blue-400 focus-within:bg-white transition-all">
        <Search size={14} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-slate-600 w-full"
        />
      </div>

      {/* 3. RIGHT: ICONS & USER (Pushed to the end) */}
      <div className="flex items-center gap-3 sm:gap-4 justify-end flex-1 md:flex-initial">
        
        {/* Messages */}
        <div className="group relative bg-slate-100 p-2 rounded-full hover:bg-blue-50 transition-colors cursor-pointer">
          <MessageCircle size={20} className="text-slate-600 group-hover:text-blue-500" />
          <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] font-bold">
            0
          </div>
        </div>

        {/* Announcements */}
        <div className="group relative bg-slate-100 p-2 rounded-full hover:bg-yellow-50 transition-colors cursor-pointer">
          <Bell size={20} className="text-slate-600 group-hover:text-yellow-600" />
          {announcementCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {announcementCount}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-3 border-l pl-3 sm:pl-4 border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-800">{firstName}</span>
            <span className="text-[9px] uppercase font-black text-slate-500">{role}</span>
          </div>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 border-2 border-white shadow-sm"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;