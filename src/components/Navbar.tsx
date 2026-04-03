"use client"; // CRITICAL

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const Navbar = ({ role, messageCount, announcementCount }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // This ensures Clerk only renders once the browser is active
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className='flex items-center justify-between p-4'>
      {/* ... your other navbar code ... */}
      
      <div className='flex items-center gap-6 justify-end w-full'>
        {/* Only show Clerk button if we are on the client */}
        {isLoaded ? <UserButton afterSignOutUrl="/" /> : <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />}
      </div>
    </div>
  );
};

export default Navbar;