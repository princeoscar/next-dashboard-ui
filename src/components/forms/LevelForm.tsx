"use client";

import { useForm } from "react-hook-form";
import { createLevel, updateLevel } from "@/lib/actions"; // Make sure to export these
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction } from "react";

const LevelForm = ({ 
  type, 
  data, 
  setOpen 
}: { 
  type: "create" | "update"; 
  data?: any; 
  setOpen: Dispatch<SetStateAction<boolean>> 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  const onSubmit = handleSubmit(async (values: any) => {
    const result = type === "create" 
      ? await createLevel({}, { name: values.name, schoolId: "1"})
      : await updateLevel({}, { ...values, id: data.id });

    if (result.success) {
      toast.success(`Level ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create a New Level" : "Update Level"}</h1>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Level Name (e.g., JSS 1)</label>
        <input {...register("name")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" defaultValue={data?.name} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Numeric Level (JSS1=7, SS1=10)</label>
        <input type="number" {...register("level")} className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm" defaultValue={data?.level} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default LevelForm;