"use client";

import { updatePersonalSettings } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Phone, MapPin, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

const PersonalSettingsForm = ({ user }: { user: any }) => {
  // Enhanced form state with pending status
  const [state, formAction] = useFormState(updatePersonalSettings, {
    success: false,
    error: false,
  });

  return (
    <form 
      action={formAction} 
      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-8 transition-all"
    >
      {/* SECTION HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
        <div className="p-2.5 bg-slate-900 text-white rounded-2xl">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">Contact Details</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage your reachable information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PHONE INPUT */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
            <Phone size={12} className="text-slate-400" />
            Primary Phone
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={user?.phone}
            placeholder="+1 (555) 000-0000"
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* ADDRESS INPUT */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
            <MapPin size={12} className="text-slate-400" />
            Residential Address
          </label>
          <input
            name="address"
            defaultValue={user?.address}
            placeholder="123 Campus Boulevard, Suite 100"
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* FOOTER & STATUS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-6 border-t border-slate-50">
        <p className="text-[10px] text-slate-400 font-medium italic max-w-[250px]">
          Changes made here will update your profile across the entire school directory.
        </p>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {state.success && (
            <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-right-2 duration-500">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Settings Synchronized</span>
            </div>
          )}

          <button
            type="submit"
            className="flex-1 sm:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            Update Profile
          </button>
        </div>
      </div>
    </form>
  );
};

export default PersonalSettingsForm;