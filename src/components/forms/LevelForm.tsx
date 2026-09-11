"use client";

import { useForm } from "react-hook-form";
import { createLevel, updateLevel } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction, useState } from "react";
import InputField from "../InputField";

const LevelForm = ({
  type,
  data,
  setOpen,
  schoolId,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  schoolId: string;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onSubmit = handleSubmit(async (values: any) => {
    setIsPending(true);
    const initialState = { success: false, error: false };

    const result = type === "create"
      ? await createLevel(initialState, {
          name: values.name,
          level: Number(values.level),
          stage: values.stage,
        })
      : await updateLevel(initialState, { 
          ...values, 
          id: data.id,
          level: Number(values.level), 
          stage: values.stage
        });

    setIsPending(false);

    if (result.success) {
      toast.success(`Level ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Something went wrong!");
    }
  });

  return (
    <form className="flex flex-col w-full max-w-lg mx-auto pt-6 md:pt-8 max-h-[85vh] overflow-y-auto" onSubmit={onSubmit}>
      <div className="top-0 text-center bg-white z-50 px-6 pt-6 pb-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Level</span>
        </h1>
      </div>

      <div className="px-6 py-6 space-y-4 pb-20">
        <InputField 
          label="Level Name (e.g., JSS 1)" 
          name="name" 
          defaultValue={data?.name} 
          register={register} 
          error={errors?.name} 
        />
        
        <InputField 
          label="Numeric Level (JSS1=7, SS1=10)" 
          name="level" 
          type="number" 
          defaultValue={data?.level} 
          register={register} 
          error={errors?.level} 
        />
      </div>

      <div className="bottom-0 bg-white px-6 py-4 border-t z-50 mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-6 py-2.5 text-xs md:text-sm font-bold text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-2.5 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-rubixPurple disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>{type === "create" ? "Create Level" : "Update Level"}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default LevelForm;