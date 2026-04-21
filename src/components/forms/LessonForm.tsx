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
    resolver: zodResolver(lessonSchema) as any,
  });

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({ ...formData, id: data?.id });
    });
  });

  const { subjects, classes, teachers } = relatedData || {};

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto mt-6 text-center" onSubmit={onSubmit}>
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Schedule" : "Update"} <span className="text-blue-500">Lesson</span>
        </h1>
      </div>

      <div className="px-6 py-6 space-y-8 pb-28 mt-5">
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Lesson Title"
            name="name"
            defaultValue={data?.name}
            register={register}
            error={errors.name}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Day of Week</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              {...register("day")}
              defaultValue={data?.day}
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
            </select>
            {errors.day?.message && <p className="text-[10px] text-red-500">{errors.day.message.toString()}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Start Time" name="startTime" type="time" defaultValue={data?.startTime} register={register} error={errors.startTime} />
          <InputField label="End Time" name="endTime" type="time" defaultValue={data?.endTime} register={register} error={errors.endTime} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SUBJECT */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              {...register("subjectId")}
              defaultValue={data?.subjectId}
            >
              {subjects?.map((s: any) => (
                <option value={s.id} key={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* CLASS */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              {...register("classId")}
              defaultValue={data?.classId}
            >
              {classes?.map((c: any) => (
                <option value={c.id} key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* TEACHER */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Teacher</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              {...register("teacherId")}
              defaultValue={data?.teacherId}
            >
              {teachers?.map((t: any) => (
                <option value={t.id} key={t.id}>{t.name} {t.surname}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          {type === "create" ? "Confirm Schedule" : "Update Schedule"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;