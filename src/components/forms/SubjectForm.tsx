"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchema";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction({ ...data });
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers, classes } = relatedData;

  return (
    <form className="flex flex-col w-full" onSubmit={onSubmit}>
      <div className="text-center bg-white px-6 py-2">
        <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create" : "Update"} <span className="text-rubixPurple">Subject</span>
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* SUBJECT NAME */}
        <InputField
          label="Subject name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        {data && <input type="hidden" {...register("id")} defaultValue={data?.id} />}

        {/* 1. ASSIGN TO CLASSES (Checkbox Grid) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Target Classes
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl ring-[1.5px] ring-gray-200 max-h-40 overflow-y-auto custom-scrollbar">
            {classes?.map((cls: any) => (
              <label key={cls.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-xl transition-all border border-transparent hover:border-gray-200">
                <input
                  type="checkbox"
                  value={cls.id}
                  className="w-4 h-4 rounded accent-rubixPurple"
                  {...register("classes")}
                  defaultChecked={data?.classes?.some((c: any) => c.id === cls.id)}
                />
                <span className="text-slate-600 font-medium">Class {cls.name}</span>
              </label>
            ))}
          </div>
          {errors.classes?.message && (
            <p className="text-[10px] text-red-400 font-medium">{errors.classes.message.toString()}</p>
          )}
        </div>

        {/* 2. ASSIGN TEACHERS (Checkbox Grid) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Assign Teachers
          </label>
          <div className="grid grid-cols-1 gap-2 bg-slate-50 p-4 rounded-2xl ring-[1.5px] ring-gray-200 max-h-40 overflow-y-auto custom-scrollbar">
            {teachers?.map((teacher: any) => (
              <label key={teacher.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white p-2 rounded-xl transition-all border border-transparent hover:border-gray-200">
                <input
                  type="checkbox"
                  value={teacher.id}
                  className="w-4 h-4 rounded accent-rubixPurple"
                  {...register("teachers")}
                  defaultChecked={data?.teachers?.some((t: any) => t.id === teacher.id)}
                />
                <div className="flex flex-col">
                    <span className="text-slate-700 font-bold">{teacher.name} {teacher.surname}</span>
                    <span className="text-[10px] text-slate-400">ID: {teacher.id}</span>
                </div>
              </label>
            ))}
          </div>
          {errors.teachers?.message && (
            <p className="text-[10px] text-red-400 font-medium">{errors.teachers.message.toString()}</p>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {state.error && <span className="text-red-500 text-[10px] block mb-2 text-center font-bold">Error saving subject.</span>}
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg active:scale-[0.98]">
          {type === "create" ? "Confirm & Create" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;