"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface BulkResultFormProps {
  students: any[];
  action: (formData: FormData) => Promise<any>;
}

export default function BulkResultForm({ students, action }: BulkResultFormProps) {
  const [state, setState] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  };

  return (
    <form
      action={handleSubmit}
      className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-4xl relative"
    >
      
      {/* SUCCESS */}
      {state?.success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
          <CheckCircle2 size={18} />
          <p className="text-xs font-black uppercase tracking-widest">
            {state.message}
          </p>
        </div>
      )}

      {/* ERROR */}
      {state?.error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700">
          <AlertCircle size={18} />
          <p className="text-xs font-black uppercase tracking-widest">
            {state.message}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Student
              </th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40 text-center">
                Score (%)
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {students.map((student) => (
              <tr
                key={student.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-5 font-bold text-slate-700">
                  {student.name} {student.surname}
                </td>

                <td className="px-4 py-5 text-center">
                  <input
                    type="number"
                    name={`score-${student.id}`}
                    min="0"
                    max="100"
                    required
                    className="w-24 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-center font-black"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className={`flex items-center gap-2 px-10 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all ${
            isPending
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-sky-600"
          }`}
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Saving..." : "Publish All Grades"}
        </button>
      </div>
    </form>
  );
}