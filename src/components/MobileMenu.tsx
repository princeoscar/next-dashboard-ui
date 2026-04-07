"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";

const MobileMenu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity lg:hidden"
      >
        <Image src="/logo.png" alt="logo" width={32} height={32} />
        
        {/* Hamburger */}
        <div className="flex flex-col gap-[3px]">
          <span className="w-5 h-[2px] bg-slate-700"></span>
          <span className="w-5 h-[2px] bg-slate-700"></span>
          <span className="w-5 h-[2px] bg-slate-700"></span>
        </div>
      </button>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* SIDEBAR */}
          <div className="relative w-72 h-full bg-white p-6 shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <span className="font-bold text-lg">Rubix Schools</span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl text-slate-500"
              >
                ×
              </button>
            </div>

            {/* MENU (ONLY ONCE — FIXED) */}
            <div className="flex-1 overflow-y-auto">
              <Menu role={role} isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;