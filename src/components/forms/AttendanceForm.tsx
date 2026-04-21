"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createAttendance } from "@/lib/actions";
import { UserCheck, ListChecks, CheckCircle2, Calendar, BookOpen } from "lucide-react";

const AttendanceForm = ({
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
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema) as any,
    defaultValues: {
      date: data?.date ? new Date(data.date) : new Date(),
      lessonId: data?.lessonId || undefined,
      students: data?.students || relatedData?.students?.map((s: any) => ({
        studentId: s.id,
        present: true,
      })) || [],
    }
  });

  const { fields } = useFieldArray({ control, name: "students" });
  const [state, formAction] = useActionState<any, any>(createAttendance, { success: false, error: false });
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Attendance ${type === "create" ? "finalized" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { lessons, students: studentList } = relatedData || {};

  const markAllPresent = () => {
    fields.forEach((_, index) => {
      setValue(`students.${index}.present` as any, true);
    });
  };

  return (
    <form 
      className="flex flex-col gap-8 w-full max-w-2xl mx-auto p-2 md:p-4" 
      onSubmit={handleSubmit((data) => {
        startTransition(() => {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value as any);
          });
          formAction(formData);
        });
      })}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
            <UserCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              {type === "create" ? "Attendance" : "Edit Record"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              Daily Registry System
            </p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={markAllPresent}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <CheckCircle2 size={16} />
          Mark All Present
        </button>
      </div>

      {/* TOP SECTION: DATE & LESSON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
        <div className="flex flex-col gap-2">
            <InputField
            label="Lesson Date"
            name="date"
            type="date"
            register={register}
            registerOptions={{ valueAsDate: true }}
            defaultValue={new Date().toISOString().split("T")[0]}
            error={errors.date}
            />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
            <BookOpen size={12} /> Lesson Session
          </label>
          <div className="relative">
            <select
              {...register("lessonId", { valueAsNumber: true })}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-semibold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              defaultValue={data?.lessonId}
            >
              <option value="">-- Select Lesson --</option>
              {lessons?.map((lesson: any) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.name} ({lesson.class.name})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
            </div>
          </div>
          {errors.lessonId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase ml-1">{errors.lessonId.message.toString()}</p>
          )}
        </div>
      </div>

      {/* STUDENT LIST AREA */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 px-2">
          <ListChecks size={20} className="text-indigo-600" />
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Student Roster</h2>
          <span className="ml-auto text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">
            {fields.length} Students
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto p-1 custom-scrollbar">
          {fields.map((item, index) => {
            const studentInfo = studentList?.find((s: any) => s.id === item.studentId);
            const isPresent = watch(`students.${index}.present`);

            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                  isPresent 
                  ? "bg-white border-slate-50 shadow-sm" 
                  : "bg-rose-50/50 border-rose-100 shadow-none scale-[0.98]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all transform rotate-3 ${
                    isPresent ? "bg-indigo-50 text-indigo-600" : "bg-rose-500 text-white rotate-0"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-black tracking-tight ${isPresent ? "text-slate-800" : "text-rose-700"}`}>
                      {studentInfo ? `${studentInfo.name} ${studentInfo.surname}` : "Student"}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isPresent ? "text-emerald-500" : "text-rose-400"}`}>
                      {isPresent ? "• Present" : "• Absent"}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register(`students.${index}.present` as const)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <input type="hidden" {...register(`students.${index}.studentId` as const)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pt-6 pb-2 border-t border-slate-100 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-bold uppercase tracking-tighter">
                    Review status before finalizing
                </p>
            </div>
            <button className="w-full sm:w-auto bg-slate-900 hover:bg-indigo-600 text-white py-4 px-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95">
            {type === "create" ? "Save Registry" : "Update Records"}
            </button>
        </div>
      </div>
    </form>
  );
};

export default AttendanceForm;