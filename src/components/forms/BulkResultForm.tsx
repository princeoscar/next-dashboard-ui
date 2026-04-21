"use client";

import { useFormState } from "react-dom";
import { useState, useEffect, useActionState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BulkResultForm({ students, action }: { students: any[], action: any }) {
  // Ensure the initial state matches what your Server Action returns
  const [state, formAction, isPending] = useActionState(action, { success: false, error: false, message: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [scores, setScores] = useState<{ [key: string]: string }>({});

  const getGrade = (score: number) => {
    if (score >= 85) return { label: "A+", color: "bg-emerald-500" };
    if (score >= 70) return { label: "A", color: "bg-blue-500" };
    if (score >= 50) return { label: "C", color: "bg-amber-500" };
    return { label: "F", color: "bg-rose-500" };
  };

  useEffect(() => {
    if (state.success) {
     toast.success(state.message || "Results saved successfully!");
      // Adding a small delay before redirecting helps the user see the success toast
      setTimeout(() => {
        router.push("/list/results");
        router.refresh();
      }, 500);
    } else if (state.error) {
      toast.error(state.message || "An error occurred while saving.");
      setLoading(false);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
     <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">Student</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 w-40">Score (%)</th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400 w-32">Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const currentScore = scores[student.id] || "";
              const grade = currentScore !== "" ? getGrade(parseInt(currentScore)) : null;

              return (
                <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700 text-xs uppercase">
                    {student.name} {student.surname}
                    <input type="hidden" name="studentId" value={student.id} />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      name="score"
                      max="100"
                      min="0"
                      required
                      value={currentScore}
                      onChange={(e) => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                      className="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-black text-sm"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="p-4">
                    {grade && (
                      <span className={`${grade.color} text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm transition-all`}>
                        {grade.label}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button 
          disabled={isPending} // ✅ Uses isPending from useActionState
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg active:scale-95"
        >
          {isPending ? "Saving Records..." : "Save All Results"}
        </button>
      </div>
    </form>
  );
}