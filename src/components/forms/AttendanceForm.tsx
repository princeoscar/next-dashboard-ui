"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { createAttendance } from "@/lib/actions";
import { UserCheck, ListChecks, Info } from "lucide-react";

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

  const { fields } = useFieldArray({
    control,
    name: "students",
  });

  const [state, formAction] = useActionState<any, any>(
    createAttendance,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Success: Attendance ${type === "create" ? "finalized" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { lessons, students } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        // Use an explicit cast to tell TS exactly what formAction is
        const submitAction = formAction as (data: AttendanceSchema) => void;
        submitAction(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <UserCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "Roll Call" : "Edit Record"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Daily Attendance Management
          </p>
        </div>
      </div>

      {/* TOP SECTION: DATE & LESSON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Date of Lesson"
          name="date"
          type="date"
          register={register}
          registerOptions={{ valueAsDate: true }}
          defaultValue={
            data?.date
              ? new Date(data.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          error={errors.date}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Lesson Session
          </label>
          <select
            {...register("lessonId", { valueAsNumber: true })}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none"
            defaultValue={data?.lessonId}
          >
            <option value="">-- Select Lesson --</option>
            {lessons?.map((lesson: any) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} ({lesson.class.name})
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* STUDENT CHECKLIST AREA */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ListChecks size={18} className="text-slate-400" />
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-tighter">Student Checklist</h2>
          </div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full shadow-sm">
            {fields.length} Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {fields.length > 0 ? (
            fields.map((item, index) => {
              const studentInfo = students?.find((s: any) => s.id === item.studentId);
              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">
                        {studentInfo ? `${studentInfo.name} ${studentInfo.surname}` : "Loading..."}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                        ID: {item.studentId.toString().slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`students.${index}.present` as const)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                  </label>

                  <input type="hidden" {...register(`students.${index}.studentId` as const)} />
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <Info className="text-slate-300 mb-2" size={32} />
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                 Awaiting Roster Selection...
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK & ACTIONS */}
      <div className="flex flex-col gap-4">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
              Critical: Database Synchronization Failed
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
             <Info size={14} />
             <p className="text-[10px] font-bold uppercase tracking-tight italic">
               Unchecked students will be marked as absent.
             </p>
          </div>

          <button className="flex items-center gap-3 bg-slate-900 hover:bg-emerald-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
            {type === "create" ? "Submit Attendance" : "Update Logs"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AttendanceForm;