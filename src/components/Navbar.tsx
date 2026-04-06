"use client"; // CRITICAL

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";

interface NavbarProps {
  role?: string;
  messageCount?: number;
  announcementCount?: number;
}

const Navbar = ({ role, messageCount, announcementCount }: any) => {
  const {user} = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  // This ensures Clerk only renders once the browser is active
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className='flex items-center justify-between p-4'>
     <div className="hidden md:flex items-center gap-2 text-xs rounded-full 
     ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center
         justify-center cursor-pointer relative hover:bg-slate-100
          transition"
          onClick={() => console.log("Navigate to messages")}>
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          {messageCount > 0 && (
            <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
              {messageCount}
            </div>
          )}
        </div>

         {/* ANNOUNCEMENTS */}
        <div 
          className="bg-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer relative hover:bg-slate-100 transition"
          onClick={() => console.log("Navigate to announcements")}
        >
          <Image src="/announcement.png" alt="announcements" width={20} height={20} />
          {announcementCount > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-[10px]">
              {announcementCount}
            </div>
          )}
        </div>


        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName} {user?.lastName || "User"}
            </span>
            
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;