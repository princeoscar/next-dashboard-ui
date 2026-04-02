"use client";

import { updateSchoolSettings } from "@/lib/actions";
import { useFormState, useFormStatus } from "react-dom";
import { 
  Building2, 
  CalendarDays, 
  Flag, 
  Percent, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface ActionState {
  success: boolean;
  error: boolean;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 disabled:bg-slate-300 transition-all active:scale-95 shadow-xl shadow-slate-200 overflow-hidden"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Save size={16} className="transition-transform group-hover:-translate-y-1" />
      )}
      <span>{pending ? "Propagating..." : "Apply Global Changes"}</span>
    </button>
  );
};

const SchoolSettingsForm = ({ settings }: { settings: any }) => {
  const [state, formAction] = useFormState<ActionState, any>(
    updateSchoolSettings,
    {
      success: false,
      error: false,
    }
  );

  return (
    <form 
      action={formAction} 
      className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Institutional Config</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">
              Global system parameters & academic standards
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {/* SCHOOL NAME */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Building2 size={12} className="text-slate-400" />
            Official Institution Name
          </label>
          <input
            name="schoolName"
            defaultValue={settings?.schoolName}
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* ACADEMIC YEAR */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <CalendarDays size={12} className="text-slate-400" />
            Active Academic Session
          </label>
          <input
            name="currentYear"
            defaultValue={settings?.currentYear}
            placeholder="e.g., 2025-2026"
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* CURRENT TERM */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Flag size={12} className="text-slate-400" />
            Current Semester / Term
          </label>
          <input
            name="currentTerm"
            defaultValue={settings?.currentTerm}
            className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* PASSING GRADE */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            <Percent size={12} className="text-amber-500" />
            Minimum Passing Threshold
          </label>
          <div className="relative">
            <input
              type="number"
              name="passingGrade"
              defaultValue={settings?.passingGrade}
              className="w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-200 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">%</span>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION AREA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50">
        <div className="flex items-center gap-3 bg-amber-50/50 px-4 py-3 rounded-2xl border border-amber-100/50">
          <AlertCircle size={16} className="text-amber-500" />
          <p className="text-[10px] text-amber-700 font-bold leading-tight max-w-[300px]">
            Updating these settings affects all students, report cards, and automated grade calculations immediately.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          {state.success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Global Sync Complete</span>
            </div>
          )}
          {state.error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 animate-in shake duration-500">
              <AlertCircle size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Update Rejected</span>
            </div>
          )}
          <SubmitButton />
        </div>
      </div>
    </form>
  );
};

export default SchoolSettingsForm;