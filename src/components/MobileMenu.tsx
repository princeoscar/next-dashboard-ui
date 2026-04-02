"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";

const MobileMenu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* THE TRIGGER: Logo + Hamburger */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Image src="/logo.png" alt="logo" width={32} height={32} />
        {/* Optional: Add a small hamburger icon next to it */}
        <div className="lg:hidden p-1 bg-slate-100 rounded">
           
        </div>
      </button>

      {/* FULL SCREEN DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Dark Background Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Sidebar Panel */}
          <div className="relative w-72 h-full bg-white p-6 shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <span className="font-bold text-xl">Rubix Schools</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="text-2xl text-slate-500">
                &times; 
              </button>
            </div>

            {/* Menu items show with labels here because the drawer is wide (w-72) */}
            <div className="flex-1 overflow-y-auto">
               <Menu role={role}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;