"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createExam, updateExam, type State } from "@/lib/actions"; 
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify"; 
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

  const {
    classes = [],
    subjects = [],
    teachers = []
  } = relatedData || {};

  // 🎯 Update the onSubmit handler to catch the native event wrapper
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 1. Block the submit event from bubbling up to other elements/forms on the page
    e.stopPropagation();
    
    // 2. Hand it over to React Hook Form's execution handler
    handleSubmit(
      (formData) => {
        console.log("SUCCESS SUBMIT PAYLOAD:", formData);
        startTransition(() => {
          formAction({
            ...formData,
            schoolId: "1", 
            classId: String(formData.classId || relatedData.classId),
            teacherId: formData.teacherId || relatedData.teacherId,
            id: type === "update" ? Number(data?.id) : undefined,
          });
        });
      },
      (validationErrors) => {
        console.log("VALIDATION FAILED:", validationErrors);
      }
    )(e); // Pass the event down here
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  // 🎯 Extracting functions outside JSX to prevent SWC Compiler parser parsing errors
  const getCohortDefaultValue = () => {
    if (!data?.classId) return "";
    const targetClass = classes.find((c: any) => c.id === data.classId);
    if (!targetClass) return "";
    
    const baseName = targetClass.name.replace(/\s*[A-Z]$/i, "").trim();
    const cohortIds = classes
      .filter((c: any) => c.name.replace(/\s*[A-Z]$/i, "").trim() === baseName)
      .map((c: any) => c.id);
      
    return cohortIds.join(",");
  };

  const renderClassOptions = () => {
    const levelsMap: { [key: string]: any[] } = {};
    
    classes.forEach((c: { id: string | number; name: string }) => {
      const baseName = c.name.replace(/\s*[A-Z]$/i, "").trim();
      if (!levelsMap[baseName]) levelsMap[baseName] = [];
      levelsMap[baseName].push(c.id);
    });

    return Object.entries(levelsMap).map(([gradeName, ids]) => (
      <option value={ids.join(",")} key={gradeName}>
        {gradeName}
      </option>
    ));
  };

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      
      {type === "update" && data?.id && (
        <input 
          type="hidden" 
          value={Number(data.id)} 
          {...register("id", { valueAsNumber: true })} 
        />
      )}

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
            defaultValue={formatDate(data?.startTime)} 
            register={register}
            error={errors?.startTime}
            type="datetime-local"
          />
          <InputField
            label="End Date"
            name="endTime"
            defaultValue={formatDate(data?.endTime)} 
            register={register}
            error={errors?.endTime}
            type="datetime-local"
          />

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subject</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("subjectId")}
              defaultValue={data?.subjectId}
            >
              <option value="">Select a Subject</option>
              {subjects.map((subject: { id: number; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId?.message && (
              <p className="text-[10px] text-red-500">
                {errors.subjectId.message.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-xs text-gray-500">Class Cohort</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
              defaultValue={getCohortDefaultValue()}
            >
              <option value="">Select Class Group</option>
              {renderClassOptions()}
            </select>
            {errors.classId?.message && (
              <p className="text-[10px] text-red-500">
                {errors.classId.message.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-xs text-gray-500">Teacher</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("teacherId")}
              defaultValue={data?.teacherId} 
            >
              <option value="">Select Teacher</option>
              {teachers.map((t: { id: string | number; name: string; surname: string }) => (
                <option value={t.id} key={t.id}>
                  {t.name} {t.surname}
                </option>
              ))}
            </select>
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