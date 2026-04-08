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
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* SIDEBAR */}
          <div className="relative w-72 h-full bg-white flex flex-col animate-in slide-in-from-left duration-300">
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <Image src="/logo.png" alt="logo" width={32} height={30} />
                <span className="font-bold text-lg">Rubix Schools</span>
              </Link>

              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* SCROLLABLE MENU AREA ✅ */}
            <div className="flex-1 overflow-y-auto p-5">
              <Menu role={role} isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;