"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";
import { X } from "lucide-react";

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

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Image src="/logo.png" alt="logo" width={32} height={32} />
      </button>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">

          {/* OVERLAY with smoother blur */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* SIDEBAR */}
          <div className="relative w-80 h-screen max-h-screen bg-white flex flex-col overflow-hidden animate-in slide-in-from-left duration-500 shadow-2xl">

            {/* HEADER - BEAUTIFIED LOGO SECTION */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50 flex-shrink-0 bg-white z-10">
              <Link
                href="/"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                {/* Apply Premium font 'font-playfair' here */}
                <span className="text-2xl font-bold font-playfair tracking-tight text-slate-900">
                  <span className="text-blue-600">Rubix</span> Schools
                </span>
              </Link>

              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* SCROLLABLE MENU AREA - PERFECT ALIGNMENT */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {/* Added a small container to ensure internal padding matches the header */}
              <div className="py-2">
                 <Menu role={role} onClose={handleClose} />
              </div>

              {/* Bottom Spacer for thumb-reach clearance */}
              <div className="h-20" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;