"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { createResult, updateResult } from "@/lib/actions";
import { Trophy, User, FileText, ClipboardCheck, Info } from "lucide-react";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: data,
  });

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createResult : updateResult,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Result has been ${type === "create" ? "recorded" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { students, exams, assignments } = relatedData || {};

  return (
    <form
      className="flex flex-col gap-8 p-2"
      onSubmit={handleSubmit((formData) => {
        // Essential cast to resolve ts(2554)
        (formAction as (data: ResultSchema) => void)(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-sm">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Result" : "Edit Score"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Academic Performance Recording
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        {/* SCORE INPUT */}
        <InputField
          label="Numerical Score"
          name="score"
          type="number"
          register={register}
          defaultValue={data?.score}
          error={errors.score}
        />

        {/* STUDENT SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Student
          </label>
          <div className="relative group">
            <select
              {...register("studentId")}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all appearance-none"
              defaultValue={data?.studentId}
            >
              <option value="">Select Student</option>
              {students?.map((s: any) => (
                <option value={s.id} key={s.id}>
                  {s.name} {s.surname}
                </option>
              ))}
            </select>
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>
          {errors.studentId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        {/* EXAM SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Exam (if applicable)
          </label>
          <div className="relative group">
            <select
              {...register("examId", { 
                setValueAs: (v) => v === "" ? null : parseInt(v) 
              })}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all appearance-none"
              defaultValue={data?.examId || ""}
            >
              <option value="">None</option>
              {exams?.map((e: any) => (
                <option value={e.id} key={e.id}>
                  {`${e.title} (${e.lesson.subject.name})`}
                </option>
              ))}
            </select>
            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>
        </div>

        {/* ASSIGNMENT SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Assignment (if applicable)
          </label>
          <div className="relative group">
            <select
              {...register("assignmentId", { 
                setValueAs: (v) => v === "" ? null : parseInt(v) 
              })}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all appearance-none"
              defaultValue={data?.assignmentId || ""}
            >
              <option value="">None</option>
              {assignments?.map((a: any) => (
                <option value={a.id} key={a.id}>
                  {`${a.title} (${a.lesson.subject.name})`}
                </option>
              ))}
            </select>
            <ClipboardCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>
        </div>

        {data && (
          <input type="hidden" {...register("id")} defaultValue={data.id} />
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-start gap-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight leading-relaxed">
            Note: A result must be linked to either an Exam or an Assignment. If both are selected, the server logic will prioritize based on your schema rules.
          </p>
        </div>

        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              Submission Failed: Check database constraints
            </span>
          </div>
        )}

        <button className="bg-slate-900 hover:bg-amber-500 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
          {type === "create" ? "Post Result" : "Update Result"}
        </button>
      </div>
    </form>
  );
};

export default ResultForm;