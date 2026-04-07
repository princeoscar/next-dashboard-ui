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
        className="flex items-center gap-2"
      >
        <Image src="/logo.png" alt="logo" width={32} height={32} />
      </button>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* SIDEBAR */}
          <div className="relative w-72 h-full bg-white p-5 flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}>
                <Image src="/logo.png" alt="logo" width={32} height={30} />
              </Link>

              <button onClick={() => setIsOpen(false)}>✕</button>

            </div>

            {/* MENU (ONLY ONCE — FIXED) */}
              <Menu role={role} isMobile />   
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;