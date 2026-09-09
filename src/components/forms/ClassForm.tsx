"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";

import {
  createClass,
  updateClass,
} from "@/lib/server-actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { classSchema, ClassSchema } from "@/lib/validation";

const ClassForm = ({
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
    watch,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema) as any,
  });

  console.log("Submitting:", data);

  // Action state for handling server-side logic
  const onSubmit = handleSubmit(async (values) => {
    console.log("========== CLASS FORM ==========");
    console.log(values);
    console.log("Stream ID:", values.streamId);
    console.log("===============================");

    const initialState = {
      success: false,
      error: false,
      message: "",
    };

    const result =
      type === "create"
        ? await createClass(initialState, values)
        : await updateClass(initialState, {
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

  const router = useRouter();


  const {
    teachers = [],
    levels = [],
    streams = [],
  } = relatedData || {};

  console.log("LEVELS");
  console.log("LEVELS");
  console.log(JSON.stringify(levels, null, 2));


  const selectedLevelId = watch("levelId");

  console.log("watch(levelId):", watch("levelId"));

  useEffect(() => {
    console.log("LEVEL CHANGED:", selectedLevelId);
  }, [selectedLevelId]);

  console.log("================================");
  console.log("Selected Level ID:", selectedLevelId);
  console.log("Levels:", levels);
  console.log(
    "Found Level:",
    levels.find((l: any) => l.id === Number(selectedLevelId))
  );
  console.log("===============================");

  const selectedStreamId = watch("streamId");

  console.log("Selected level:", selectedLevelId);
  console.log("Selected stream:", selectedStreamId);

  const selectedLevel = levels.find(
    (level: any) => level.id === Number(selectedLevelId)
  );

  console.log({
    selectedLevelId,
    selectedLevel,
    isSenior: selectedLevel?.stage === "SENIOR",
  });




  const isSenior = selectedLevel?.stage === "SENIOR";

  console.log("Selected Level ID:", selectedLevelId);

  console.log("Selected Level Object:");
  console.log(selectedLevel);

  console.log("Stage:", selectedLevel?.stage);

  console.log("Is Senior:", selectedLevel?.stage === "SENIOR");

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Class</span>
        </h1>
      </div>
      <div className="px-6 py-6 space-y-8 pb-28 mt-5">
        <div className="flex justify-between flex-wrap gap-4">

          <InputField
            label="Class Section"
            name="name"
            defaultValue={data?.name?.replace(`${data?.level?.name ?? ""} `, "")}
            register={register}
            error={errors.name}
          />

          <InputField
            label="Capacity"
            name="capacity"
            defaultValue={data?.capacity}
            register={register}
            error={errors?.capacity}
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

          {/* SUPERVISOR SELECT */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Supervisor</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("supervisorId")}
              defaultValue={data?.supervisorId} // Corrected to use ID
            >
              <option value="">Select a teacher</option>
              {teachers.map(
                (teacher: {
                  id: string;
                  firstName: string;
                  lastName: string;
                }) => (
                  <option value={teacher.id} key={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                )
              )}
            </select>
            {errors.supervisorId?.message && (
              <p className="text-xs text-red-400">
                {errors.supervisorId.message.toString()}
              </p>
            )}
          </div>

          {/* Level SELECT */}
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Level</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("levelId")}
              defaultValue={data?.levelId}
            >
              <option value="">Select a level</option>
              {/* 🎯 Updated the type to match your model: { id: number; level: number } */}
              {levels.map((level: { id: number; level: number }) => (
                <option value={level.id} key={level.id}>
                  {/* 🎯 Use level.level to show the number (e.g., 1, 2, 3) */}
                  Level {level.level}
                </option>
              ))}
            </select>
            {errors.levelId?.message && (
              <p className="text-xs text-red-400">
                {errors.levelId.message.toString()}
              </p>
            )}
          </div>
        </div>


        {isSenior && (
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">
              Stream
            </label>

            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("streamId", {
                valueAsNumber: true,
              })}
              defaultValue={data?.streamId ?? ""}
              onChange={(e) => console.log("Stream changed:", e.target.value)}
            >
              <option value="">Select Stream</option>

              {streams.map((stream: any) => (
                <option
                  key={stream.id}
                  value={stream.id}
                >
                  {stream.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>


      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        <button
          type="submit"
          onClick={() => console.log("Button clicked")}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;