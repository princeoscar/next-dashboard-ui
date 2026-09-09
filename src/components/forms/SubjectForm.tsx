"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createSubject, updateSubject } from "@/lib/server-actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { subjectSchema, SubjectSchema } from "@/lib/validation";

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
  defaultValues: {
    name: data?.name ?? "",
    teachers: data?.teachers?.map((t: any) => t.id) ?? [],
    generalLevels:
      data?.curriculum
        ?.filter((c: any) => c.streamId === null)
        .map((c: any) => String(c.levelId)) ?? [],
    assignments:
      data?.curriculum
        ?.filter((c: any) => c.streamId !== null)
        .map((c: any) => `${c.levelId}-${c.streamId}`) ?? [],
  },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false, message: "", }
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
    console.log("FORM SUBMITTED");
    console.log(values);


    const initialState = {
      success: false,
      error: false,
      message: "",
    };

    const result =
      type === "create"
        ? await createSubject(initialState, values)
        : await updateSubject(initialState, {
          ...values,
          id: data.id,
        });



    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });

  const {
  teachers,
  levels,
  streams,
} = relatedData;

const juniorLevels = levels.filter(
  (level: any) =>
    level.name.toUpperCase().startsWith("JSS")
);

const seniorLevels = levels.filter(
  (level: any) =>
    level.name.toUpperCase().startsWith("SSS")
);

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
        {/* Applicable Levels */}
        <div className="space-y-8">

  {/* ===========================
      JUNIOR SCHOOL
  =========================== */}

  <div>

    <h2 className="font-black text-rubixPurple uppercase mb-4">
      Junior Secondary School
    </h2>

    <div className="space-y-3">

      {juniorLevels.map((level: any) => (

        <label
          key={level.id}
          className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl"
        >

          <input
            type="checkbox"
            value={level.id}
            {...register("generalLevels")}
            className="accent-rubixPurple"
          />

          <span>{level.name}</span>

        </label>

      ))}

    </div>

  </div>

  {/* ===========================
      SENIOR SCHOOL
  =========================== */}

  <div>

    <h2 className="font-black text-rubixPurple uppercase mb-4">
      Senior Secondary School
    </h2>

    <div className="space-y-6">

      {seniorLevels.map((level: any) => (

        <div
          key={level.id}
          className="rounded-2xl border p-5"
        >

          <label className="flex items-center gap-3 font-bold">

            <input
  type="checkbox"
  value={level.id}
  {...register("generalLevels")}
  defaultChecked={
    data?.curriculum?.some(
      (item: any) =>
        item.levelId === level.id &&
        item.streamId === null
    )
  }
  className="accent-rubixPurple"
/>

            {level.name} (General)

          </label>

          <div className="grid grid-cols-2 gap-3 mt-5 ml-7">

            {streams.map((stream: any) => (

              <label
                key={`${level.id}-${stream.id}`}
                className="flex items-center gap-2"
              >

                <input
  type="checkbox"
  value={`${level.id}-${stream.id}`}
  {...register("assignments")}
  defaultChecked={
    data?.curriculum?.some(
      (item: any) =>
        item.levelId === level.id &&
        item.streamId === stream.id
    )
  }
  className="accent-rubixPurple"
/>

                {stream.name}

              </label>

            ))}

          </div>

        </div>

      ))}

    </div>

  </div>

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
                  <span className="text-slate-700 font-bold">{teacher.firstName} {teacher.lastName}</span>
                  <span className="text-[10px] text-slate-400">ID: {teacher.username}</span>
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