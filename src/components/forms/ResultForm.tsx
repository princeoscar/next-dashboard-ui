"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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

  const [state, formAction] = useActionState(
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

  const { students, exams, assignments, academicYears, subjects } = relatedData || {};


const handleRawSubmit = (e: React.FormEvent) => {
  console.log("Button actually clicked - Form is attempting to submit");
};

// Then update your form tag temporarily:
<form className="flex flex-col gap-8 p-2" onSubmit={(e) => {
  handleRawSubmit(e);
  onSubmit(e);
}}></form>

  const onSubmit = handleSubmit(
  (formData) => {
    // 1. Calculate Scores manually to ensure they are valid numbers
    const test = Number(formData.testScore) || 0;
    const assignment = Number(formData.assignmentScore) || 0;
    const exam = Number(formData.examScore) || 0;
    const total = test + assignment + exam;

    // 2. Automated Grade Logic (Adjust thresholds to match your school)
    let autoGrade = "F9";
if (total >= 80) autoGrade = "A1";
else if (total >= 75) autoGrade = "B2";
else if (total >= 70) autoGrade = "B3";
else if (total >= 66) autoGrade = "C4";
else if (total >= 60) autoGrade = "C5";
else if (total >= 55) autoGrade = "C6";
else if (total >= 50) autoGrade = "D7";
else if (total >= 45) autoGrade = "E8";

    console.log("✅ FORM VALIDATED. SENDING PAYLOAD...");

    startTransition(() => {
      formAction({
        ...formData,
        // Ensure ID is passed as a string for the UUID update
        id: type === "update" ? data?.id : undefined,
        
        // Clean Number conversions for Prisma
        testScore: test,
        assignmentScore: assignment,
        examScore: exam,
        totalScore: total,
        grade: autoGrade,
        subjectId: Number(formData.subjectId),
        academicYearId: Number(formData.academicYearId),
        term: Number(formData.term),
        
        // Handle optional relations
        examId: formData.examId ? Number(formData.examId) : null,
        assignmentId: formData.assignmentId ? Number(formData.assignmentId) : null,
      });
    });
  },
  (validationErrors) => {
    // 🎯 THIS IS THE IMPORTANT PART: 
    // If the button does nothing, this will tell us EXACTLY why.
    console.log("VALIDATION ERRORS:", validationErrors);
    alert("Form Error: Check the browser console (F12) to see which field is invalid.");
  }
);

  return (
    <form className="flex flex-col gap-8 p-2" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-sm">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-center text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Result" : "Edit Total Score"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Academic Performance Recording
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ...">
        {/* STUDENT SELECTOR */}
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
              <option value="">Select Student...</option>
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

        {/* Subject Select */}
        <select
          {...register("subjectId")}
          defaultValue={data?.subjectId} // 🎯 This ensures the value is set on load
          className="..."
        >
          <option value="">Select Subject...</option>
          {subjects?.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Academic Year Select */}
        <select
          {...register("academicYearId")}
          defaultValue={data?.academicYearId} // 🎯 This ensures the value is set on load
          className="..."
        >
          <option value="">Select Year...</option>
          {academicYears?.map((y: any) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>

        {/* TERM SELECTOR - 🎯 ADDED defaultValue */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500">Term</label>
          <select
            {...register("term")}
            className="p-4 rounded-2xl bg-slate-50 border"
            defaultValue={data?.term}
          >
            <option value="1">First Term</option>
            <option value="2">Second Term</option>
            <option value="3">Third Term</option>
          </select>
        </div>

        {/* TEST SCORE */}
        <InputField
          label="Test Score (e.g., 20%)"
          name="testScore"
          type="number"
          register={register}
          defaultValue={data?.testScore}
          error={errors.testScore}
        />

        {/* ASSIGNMENT SCORE */}
        <InputField
          label="Assignment Score (e.g., 20%)"
          name="assignmentScore"
          type="number"
          register={register}
          defaultValue={data?.assignmentScore}
          error={errors.assignmentScore}
        />

        {/* EXAM SCORE */}
        <InputField
          label="Exam Score (e.g., 60%)"
          name="examScore"
          type="number"
          register={register}
          defaultValue={data?.examScore}
          error={errors.examScore}
        />
          {/* SCORE INPUT */}
        <InputField
          label="Total Score"
          name="totalScore"
          type="number"
          register={register}
          defaultValue={data?.totalScore}
          error={errors.totalScore}
        />




        {/* <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Linked Exam
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
                  {e.title} {e.subject?.name ? `(${e.subject.name})` : ""}
                </option>
              ))}
            </select>
            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>
        </div> */}


        {/* <div className="flex flex-col gap-2">
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
                  {a.title} {a.subject?.name ? `(${a.subject.name})` : ""}
                </option>
              ))}
            </select>
            <ClipboardCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-amber-500 transition-colors" size={18} />
          </div>
        </div> */}

        {data && (
          <input type="hidden" {...register("id")} defaultValue={data.id} />
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-start gap-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
          <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight leading-relaxed">
            Note: A result must be linked to either an Exam or an Assignment.
          </p>
        </div>

        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              Submission Failed: Check database constraints
            </span>
          </div>
        )}

        <button type="submit"
          className="bg-slate-900 hover:bg-amber-500 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
          {type === "create" ? "Post Result" : "Update Result"}
        </button>
      </div>
    </form>
  );
};

export default ResultForm;