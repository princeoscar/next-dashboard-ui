"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import MobileMenu from "./MobileMenu"; // ✅ IMPORT ADDED

interface NavbarProps {
  role?: string;
  messageCount?: number;
  announcementCount?: number;
}

const Navbar = ({
  role = "student",
  messageCount = 0,
  announcementCount = 0,
}: NavbarProps) => {
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        
        {/* ✅ MOBILE MENU (THIS FIXES YOUR ISSUE) */}
        <MobileMenu role={role} />

        {/* SEARCH (HIDDEN ON SMALL SCREENS) */}
        <div className="hidden md:flex items-center gap-2 text-xs rounded-full 
        ring-[1.5px] ring-gray-300 px-2">
          <Image src="/search.png" alt="search" width={14} height={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] p-2 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* MESSAGES */}
        <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-slate-100 transition">
          <Image src="/message.png" alt="messages" width={20} height={20} />
          {messageCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px] font-bold">
              {messageCount}
            </div>
          )}
        </div>

        {/* ANNOUNCEMENTS */}
        <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-slate-100 transition">
          <Image src="/announcement.png" alt="announcements" width={20} height={20} />
          {announcementCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px] font-bold">
              {announcementCount}
            </div>
          )}
        </div>

        {/* USER INFO (HIDE ON SMALL SCREENS FOR CLEAN UI) */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName} {user?.lastName || ""}
          </span>
          <span className="text-[10px] text-gray-500 capitalize">
            {(user?.publicMetadata?.role as string) || "Guest"}
          </span>
        </div>

        {/* USER BUTTON */}
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;