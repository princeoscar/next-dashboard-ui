"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";

const MobileMenu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 🔒 Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Image src="/logo.png" alt="logo" width={32} height={32} />
      </button>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* SIDEBAR - CORRECTION: Added h-screen, max-h-screen, and overflow-hidden */}
          <div className="relative w-72 h-screen max-h-screen bg-white flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            
            {/* HEADER - CORRECTION: Added flex-shrink-0 so it never collapses */}
            <div className="flex items-center justify-between p-5 border-b flex-shrink-0 bg-white z-10">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <span className="font-bold text-lg text-slate-800">Rubix Schools</span>
              </Link>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* SCROLLABLE MENU AREA - CORRECTION: Added flex-1 and custom height calculation */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <Menu role={role} isMobile />
              
              {/* Extra padding at the bottom to ensure the last item is visible above phone navigation bars */}
              <div className="h-20" /> 
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;