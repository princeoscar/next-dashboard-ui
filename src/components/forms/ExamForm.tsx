"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchema";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, CalendarDays, BookOpen } from "lucide-react";

const ExamForm = ({
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
  // Helper to format ISO strings for the datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTime = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      ...data,
      startTime: data?.startTime ? formatDateTime(data.startTime) : "",
      endTime: data?.endTime ? formatDateTime(data.endTime) : "",
    },
  });

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        // Essential cast to prevent ts(2554) "Expected 0 arguments" error
        (formAction as (data: ExamSchema) => void)(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Exam" : "Edit Exam"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Examination & Assessment Control
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Exam Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Associated Lesson
          </label>
          <div className="relative group">
            <select
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
              {...register("lessonId", { valueAsNumber: true })}
              defaultValue={data?.lessonId}
            >
              <option value="">Select a lesson</option>
              {lessons?.map((lesson: { id: number; name: string }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </select>
            <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          {errors.lessonId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Start Date & Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors?.startTime}
        />

        <InputField
          label="End Date & Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors?.endTime}
        />

        {data && (
          <input type="hidden" {...register("id")} defaultValue={data.id} />
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              Critical: Failed to sync exam data with server
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays size={14} />
            <p className="text-[10px] font-bold uppercase tracking-tight italic">
              Ensure times do not overlap with existing class schedules.
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
            {type === "create" ? "Add Exam" : "Update Exam"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ExamForm;