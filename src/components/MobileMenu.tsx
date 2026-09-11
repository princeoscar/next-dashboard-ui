"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Menu from "./Menu";
import { X } from "lucide-react";

const MobileMenu = ({ role }: { role: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 🔒 Lock body scroll and handle ESC key when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Open Menu"
      >
        <Image src="/logo2.png" alt="logo" width={32} height={32} />
      </button>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* OVERLAY */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* SIDEBAR CONTAINER */}
          <div className="relative w-80 h-screen max-h-screen bg-white flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 flex-shrink-0 bg-white z-10">
              <Link
                href="/"
                onClick={handleClose}
                className="flex items-center gap-2"
              >
                <span className="text-xl font-bold font-playfair tracking-tight text-slate-900">
                  <span className="text-blue-600">Rubix</span> ERP
                </span>
              </Link>

              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
                aria-label="Close Menu"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* SINGLE UNIFIED SCROLL CONTAINER */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col justify-between">
              <Menu role={role} onClose={handleClose} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;