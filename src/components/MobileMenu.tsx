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

  // CORRECTION: Function to handle closing the menu
  const handleClose = () => setIsOpen(false);

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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* SIDEBAR */}
          <div className="relative w-72 h-screen max-h-screen bg-white flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b flex-shrink-0 bg-white z-10">
              <Link
                href="/"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <span className="font-bold text-lg text-slate-800">Rubix Schools</span>
              </Link>

              <button 
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* SCROLLABLE MENU AREA */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {/* CORRECTION: Passing handleClose as a prop to Menu */}
              <Menu role={role} isMobile onClose={handleClose} />
              
              <div className="h-20" /> 
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;