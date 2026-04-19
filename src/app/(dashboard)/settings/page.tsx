"use client";

import { UserProfile } from "@clerk/nextjs";

const SettingsPage = () => {
  return (
    <div className="p-2 md:p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Account Settings</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Manage your security and preferences</p>
      </div>
      
      {/* Clerk's built-in profile manager */}
      <div className="w-full max-w-4xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-white">
        <UserProfile routing="hash" appearance={{
          elements: {
            footer: "hidden",
            footerAction: "hidden",
            internal: "display-none",
            card: "shadow-none w-full",
            navbar: "md:p-6",
            pageScrollBox: "p-4 md:p-8"
          }
        }} />
      </div>
    </div>
  );
};

export default SettingsPage;