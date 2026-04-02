"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
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

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects, classes, teachers } = relatedData || {};

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit((data) => formAction(data))}>
      <h1 className="text-xl font-bold text-slate-800">
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
        
        <InputField
          label="Day"
          name="day"
          type="select" // If your InputField supports type select, otherwise use raw select below
          defaultValue={data?.day}
          register={register}
          error={errors.day}
          // Assuming your schema uses an Enum for Monday-Friday
        />

        {data && <input type="hidden" {...register("id")} defaultValue={data.id} />}

        {/* SUBJECT SELECT */}
        <div className="flex flex-col gap-2 w-full md:w-[48%] lg:w-[31%]">
          <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-xl text-sm"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            {subjects?.map((s: { id: number; name: string }) => (
              <option value={s.id} key={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* CLASS SELECT */}
        <div className="flex flex-col gap-2 w-full md:w-[48%] lg:w-[31%]">
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
        <div className="flex flex-col gap-2 w-full md:w-[48%] lg:w-[31%]">
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

      <button className="bg-rubixSky text-white py-3 px-6 rounded-xl font-bold hover:bg-sky-500 transition-all">
        {type === "create" ? "Create Lesson" : "Update Lesson"}
      </button>
    </form>
  );
};

export default LessonForm;