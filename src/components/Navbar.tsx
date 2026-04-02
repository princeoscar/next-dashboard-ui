"use client";

import Image from "next/image";
import MobileMenu from "./MobileMenu"; 
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface NavbarProps {
  role: string;
  messageCount: number;
  announcementCount: number;
}

const Navbar = ({ role, messageCount, announcementCount }: NavbarProps) => {
  const { user, isLoaded } = useUser();

  return (
    <div className='flex items-center justify-between p-4 bg-white lg:bg-transparent'>
      
      {/* 1. LEFT SIDE: MOBILE LOGO & HAMBURGER */}
      <div className="lg:hidden flex items-center gap-2">
        <MobileMenu role={role}/>
      </div>

      {/* 2. MIDDLE: SEARCH (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="search" width={14} height={14}/>
        <input type="text" placeholder="Search..." className="w-[200px] p-2 bg-transparent outline-none"/>
      </div>

      {/* 3. RIGHT SIDE: ICONS & USER PROFILE */}
      <div className='flex items-center gap-6 justify-end w-full'>
        
        {/* Dynamic Message Icon */}
       <Link 
          href="/list/messages" 
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-slate-100 transition-colors"
        >
          <Image src="/message.png" alt="messages" width={20} height={20} />
          {messageCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px]">
              {messageCount > 9 ? "9+" : messageCount}
            </div>
          )}
        </Link>

        {/* Dynamic Announcement Icon */}
        <Link 
          href="/list/announcements" 
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-slate-100 transition-colors"
        >
          <Image src="/announcement.png" alt="announcements" width={20} height={20} />
          {announcementCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-yellow-500 text-white rounded-full text-[10px]">
              {announcementCount}
            </div>
          )}
        </Link>

        {/* User Info & Profile Button */}
        <div className="flex items-center gap-3 ml-2">
          <div className="flex flex-col">
            <span className="text-xs leading-3 font-medium text-right">
              {!isLoaded ? "Loading..." : `${user?.firstName} ${user?.lastName || ""}`}
            </span>
            <span className="text-[10px] text-gray-500 text-right capitalize">
              {role}
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

      </div>
    </div>
  );
};

export default Navbar;