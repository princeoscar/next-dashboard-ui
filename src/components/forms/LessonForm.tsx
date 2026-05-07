"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchema";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/actions";

const LessonForm = ({
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
  } = useForm<LessonSchema>({
    // @ts-ignore
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Timetable has been ${type === "create" ? "updated" : "modified"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    // 🇳🇬 Localization: If 'name' is empty, default it to the Subject Name 
    // so the Admin doesn't have to type "Mathematics" twice.
    const selectedSubject = relatedData?.subjects?.find(
      (s: any) => s.id === formData.subjectId
    );

    const payload = {
      ...formData,
      id: data?.id,
      name: formData.name || selectedSubject?.name || "New Period",
    };

    startTransition(() => {
      formAction(payload);
    });
  });

  const { subjects, classes, teachers } = relatedData || {};

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto mt-6 text-center" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Add to" : "Update"} <span className="text-blue-500">Timetable</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Assign subjects to classes and teachers</p>
      </div>

      <div className="px-6 py-6 space-y-8 pb-28 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* DESCRIPTION */}
          <InputField
            label="Period Description (Optional)"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
            placeholder="e.g. Algebra Intro"
          />

          {/* DAY OF WEEK */}
          <div className="flex flex-col gap-2 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase">Day of Week</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all bg-white"
              {...register("day")}
              defaultValue={data?.day}
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
            </select>
            {errors.day?.message && (
              <p className="text-[10px] text-red-500">{errors.day.message.toString()}</p>
            )}
          </div>
        </div>

        {/* TIME SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            defaultValue={data?.startTime}
            register={register}
            error={errors.startTime}
          />
          <InputField
            label="End Time"
            name="endTime"
            type="time"
            defaultValue={data?.endTime}
            register={register}
            error={errors.endTime}
          />
        </div>

        {/* RELATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* SUBJECT */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              {...register("subjectId")}
              defaultValue={data?.subjectId}
            >
              <option value="">Select Subject</option>
              {subjects?.map((s: any) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subjectId?.message && (
              <p className="text-[10px] text-red-500">{errors.subjectId.message.toString()}</p>
            )}
          </div>

          {/* TARGET CLASSES (Group Session Support) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Classes (Group Session)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl ring-[1.5px] ring-gray-200 max-h-48 overflow-y-auto custom-scrollbar">
              {classes?.map((c: any) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-xl transition-all border border-transparent hover:border-gray-200"
                >
                  <input
                    type="checkbox"
                    value={c.id}
                    className="w-4 h-4 rounded accent-rubixPurple"
                    {...register("classes")} // 🎯 Notice we changed "classId" to "classes" (plural)
                    defaultChecked={type === "update" ? data?.classId === c.id : false}
                  />
                  <span className="text-slate-600 font-medium">Class {c.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic px-1">
              Check multiple classes to assign this subject/time to all of them at once.
            </p>
            {errors.classes?.message && (
              <p className="text-[10px] text-red-500">{errors.classes.message.toString()}</p>
            )}
          </div>

          {/* TEACHER */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Teacher</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
              {...register("teacherId")}
              defaultValue={data?.teacherId}
            >
              <option value="">Select Teacher</option>
              {teachers?.map((t: any) => (
                <option value={t.id} key={t.id}>
                  {t.name} {t.surname}
                </option>
              ))}
            </select>
            {errors.teacherId?.message && (
              <p className="text-[10px] text-red-500">{errors.teacherId.message.toString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER BUTTON */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          {type === "create" ? "Confirm Schedule" : "Update Schedule"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;