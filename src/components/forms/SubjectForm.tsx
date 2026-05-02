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
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
  console.log("Submitting:", data); 
  startTransition(() => {
    // We provide a fallback value for schoolId if your schema still wants a string
    formAction({ ...data, schoolId: data.schoolId || "default_school" });
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

  const { teachers } = relatedData;

  return (
    <form className="flex flex-col w-full" onSubmit={onSubmit}>
      {/* HEADER - Reduced padding */}
      <div className="text-center bg-white px-6 py-2">
        <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create" : "Update"} <span className="text-rubixPurple">Subject</span>
        </h1>
      </div>

      {/* CONTENT - Removed pb-24 and large spacing */}
      <div className="p-6 space-y-4">
        <InputField
          label="Subject name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        {data && <input type="hidden" {...register("id")} defaultValue={data?.id} />}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Assign Teachers
          </label>
          <select
            multiple
            size={1} // 🎯 This keeps it compact
            className="ring-[1.5px] ring-gray-200 p-3 rounded-2xl text-sm w-full outline-none focus:ring-rubixPurple transition-all bg-slate-50"
            {...register("teachers")}
            defaultValue={data?.teachers?.map((t: any) => t.id) || []}
          >
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <option value={teacher.id} key={teacher.id} className="p-2">
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teachers?.message && (
            <p className="text-[10px] text-red-400 font-medium">{errors.teachers.message.toString()}</p>
          )}
          <p className="text-[9px] text-slate-400 italic ml-1">Ctrl + Click to select multiple</p>
        </div>
      </div>

      {/* FOOTER - Removed sticky and reduced margin */}
      <div className="px-6 pb-6">
        {state.error && <span className="text-red-500 text-[10px] block mb-2 text-center font-bold">Error saving subject.</span>}
        <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-md">
          {type === "create" ? "Confirm & Create" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;