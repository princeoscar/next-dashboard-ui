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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-50">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <MobileMenu role={role} />

        {/* SEARCH (HIDDEN ON SMALL SCREENS) */}
        <div className="hidden md:flex items-center gap-2 text-xs rounded-full 
        ring-1 ring-gray-300 px-2">
          <Image src="/search.png" alt="search" width={14} height={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-[200px] p-2 bg-transparent outline-none"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* MESSAGES */}
        <IconWithBadge icon="/message.png" count={messageCount} />

        {/* ANNOUNCEMENTS */}
        <IconWithBadge icon="/announcement.png" count={announcementCount} />

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


/* 🔹 Reusable Component */
const IconWithBadge = ({
  icon,
  count,
}: {
  icon: string;
  count: number;
}) => (
  <div className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer transition">
    <Image src={icon} alt="" width={18} height={18} />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] px-1 rounded-full">
        {count}
      </span>
    )}
  </div>
);