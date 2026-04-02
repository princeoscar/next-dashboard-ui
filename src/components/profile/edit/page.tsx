import { UserProfile } from "@clerk/nextjs";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

const EditProfilePage = () => {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between px-4">
        <Link 
          href="/profile" 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
        >
          <div className="p-2 bg-white rounded-xl border border-slate-100 group-hover:border-slate-300 transition-all">
            <ChevronLeft size={14} />
          </div>
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            Secure Identity Portal
          </span>
        </div>
      </div>

      {/* CLERK COMPONENT WRAPPER */}
      <div className="flex items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-sm p-4 md:p-12 overflow-hidden min-h-[700px]">
        <UserProfile 
          routing="hash" 
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-none border-none w-full max-w-none",
              navbar: "hidden md:flex", // Keep sidebar on desktop
              pageScrollBox: "p-0 md:p-8",
              headerTitle: "text-2xl font-black text-slate-800 tracking-tighter",
              headerSubtitle: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
              formButtonPrimary: "bg-slate-900 hover:bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              formFieldInput: "rounded-xl border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500",
              footer: "hidden", // Clean up the bottom
            }
          }}
        />
      </div>

      <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-4">
        End-to-End Encrypted by Clerk Security
      </p>
    </div>
  );
};

export default EditProfilePage;