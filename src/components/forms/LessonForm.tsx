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

  // ✅ FIX: Wrapped in startTransition
  const onSubmit = handleSubmit((formData) => {
    console.log("Form Data being submitted:", formData);
    startTransition(() => {
      formAction(formData);
    });
  });

  const { subjects, classes, teachers } = relatedData || {};

  return (
    <form className="flex flex-col gap-6 p-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold text-slate-800 text-center">
        {type === "create" ? "Create New Lesson" : "Update Lesson"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lesson Name (e.g. Morning Session)"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        
        {/* DAY SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Day</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-xl text-sm"
            {...register("day")}
            defaultValue={data?.day}
          >
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
          </select>
          {errors.day?.message && <p className="text-xs text-red-400">{errors.day.message.toString()}</p>}
        </div>

        {/* Start & End Times (Assuming these are in your schema) */}
        <InputField
         label="Start Time" 
         name="startTime"
          type="time" 
          defaultValue={data?.startTime}
           register={register} 
           error={errors.startTime} />

        <InputField 
        label="End Time"
         name="endTime" 
         type="time" 
         defaultValue={data?.endTime}
          register={register} 
          error={errors.endTime} />

        {data && <input type="hidden" {...register("id")} defaultValue={data.id} />}

        {/* SUBJECT SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-xl text-sm"
            {...register("subjectId")} // Add {valueAsNumber: true} if your schema expects Int
            defaultValue={data?.subjectId}
          >
            {subjects?.map((s: { id: number; name: string }) => (
              <option value={s.id} key={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* CLASS SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-xl text-sm"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes?.map((c: { id: number; name: string }) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* TEACHER SELECT */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">Teacher</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-xl text-sm"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            {teachers?.map((t: { id: string; name: string; surname: string }) => (
              <option value={t.id} key={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>
        </div>
      </div>

      <button className="bg-blue-400 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-500 transition-all">
        {type === "create" ? "Create Lesson" : "Update Lesson"}
      </button>
    </form>
  );
};

export default LessonForm;