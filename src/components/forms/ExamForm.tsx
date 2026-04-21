"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createExam, updateExam } from "@/lib/actions"; // Cleaned up unused imports
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify"; // Switched to toast for better UX
import { useRouter } from "next/navigation";
import { examSchema, ExamSchema } from "@/lib/formValidationSchema";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Exam ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  const onSubmit = handleSubmit((formData) => {
    console.log("Form Data being submitted:", formData);
    startTransition(() => {
      formAction(formData);
    });
  });

  const { lessons } = relatedData;

  // FIX: Format dates for datetime-local input
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Exam</span>
        </h1>
      </div>
      <div className="px-6 py-6 space-y-8 pb-28 mt-5">
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Exam title"
            name="title"
            defaultValue={data?.title}
            register={register}
            error={errors?.title}
          />
          <InputField
            label="Start Date"
            name="startTime"
            defaultValue={formatDate(data?.startTime)} // FIX: Formatted date
            register={register}
            error={errors?.startTime}
            type="datetime-local"
          />
          <InputField
            label="End Date"
            name="endTime"
            defaultValue={formatDate(data?.endTime)} // FIX: Formatted date
            register={register}
            error={errors?.endTime}
            type="datetime-local"
          />
          {data && (
            <InputField
              label="Id"
              name="id"
              defaultValue={data?.id}
              register={register}
              error={errors?.id}
              hidden
            />
          )}

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Lesson</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("lessonId")}
              defaultValue={data?.lessonId} // FIX: Corrected key
            >
              <option value="">Select a Lesson</option>
              {lessons.map((lesson: {
                id: number;
                name: string;
                class: { name: string };
                subject: { name: string }
              }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.subject.name} - {lesson.name} ({lesson.class.name})
                </option>
              ))}
            </select>
            {errors.lessonId?.message && (
              <p className="text-[10px] text-red-500">
                {errors.lessonId.message.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        {state.error && (
          <span className="text-red-500">Something went wrong!</span>
        )}
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg active:scale-[0.98]">
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;