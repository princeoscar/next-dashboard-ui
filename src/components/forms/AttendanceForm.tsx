"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createAttendance } from "@/lib/actions";
import { UserCheck, ListChecks, Info, CheckCircle2 } from "lucide-react";

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
      toast.success(`Attendance ${type === "create" ? "finalized" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { lessons, students: studentList } = relatedData || {};

  // Shortcut: Mark all as present
  const markAllPresent = () => {
    fields.forEach((_, index) => {
      setValue(`students.${index}.present` as any, true);
    });
  };

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        const submitAction = formAction as (data: AttendanceSchema) => void;
        submitAction(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rubixPurple/10 text-rubixPurple rounded-2xl">
            <UserCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              {type === "create" ? "Roll Call" : "Edit Record"}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
              Class Portal Tracking
            </p>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={markAllPresent}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
        >
          <CheckCircle2 size={14} />
          Mark All Present
        </button>
      </div>

      {/* TOP SECTION: DATE & LESSON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Date of Lesson"
          name="date"
          type="date"
          register={register}
          registerOptions={{ valueAsDate: true }}
          defaultValue={new Date().toISOString().split("T")[0]}
          error={errors.date}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Lesson Session
          </label>
          <select
            {...register("lessonId", { valueAsNumber: true })}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-rubixPurple/10 focus:border-rubixPurple outline-none transition-all appearance-none"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {fields.map((item, index) => {
            const studentInfo = studentList?.find((s: any) => s.id === item.studentId);
            const isPresent = watch(`students.${index}.present`);

            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                  isPresent ? "bg-white border-slate-100" : "bg-rose-50/30 border-rose-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-all shadow-inner ${
                    isPresent ? "bg-slate-50 text-slate-400 group-hover:bg-rubixPurple group-hover:text-white" : "bg-rose-500 text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${isPresent ? "text-slate-800" : "text-rose-700"}`}>
                      {studentInfo ? `${studentInfo.name} ${studentInfo.surname}` : "Student"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                      {isPresent ? "Status: Present" : "Status: Absent"}
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
          })}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase italic">
          Toggle switch to mark student presence.
        </p>
        <button className="bg-slate-900 hover:bg-rubixPurple text-white py-4 px-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
          {type === "create" ? "Save Records" : "Update Logs"}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;