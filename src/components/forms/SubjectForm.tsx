"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createSubject, updateSubject } from "@/lib/server-actions";
import { Dispatch, SetStateAction, useActionState, useState } from "react";
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
    { success: false, error: false, message: "" }
  );

  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
    setIsPending(true);
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

    setIsPending(false);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });

  const { teachers, levels, streams } = relatedData;

  const juniorLevels = levels.filter((level: any) =>
    level.name.toUpperCase().startsWith("JSS")
  );

  const seniorLevels = levels.filter((level: any) =>
    level.name.toUpperCase().startsWith("SSS")
  );

  return (
    <form
      className="flex flex-col w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar"
      onSubmit={onSubmit}
    >
      {/* STICKY HEADER */}
      <div className="sticky top-0 bg-white z-50 px-6 pt-6 pb-4 border-b border-slate-100 text-center">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Subject</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Configure curriculum assignments & teacher allocations
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* SUBJECT NAME */}
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        {data && <input type="hidden" {...register("id")} defaultValue={data?.id} />}

        {/* CURRICULUM SECTIONS */}
        <div className="space-y-6">
          {/* ===========================
              JUNIOR SCHOOL
          =========================== */}
          <div>
            <h2 className="text-xs font-black text-rubixPurple uppercase tracking-wider mb-3">
              Junior Secondary School
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {juniorLevels.map((level: any) => (
                <label
                  key={level.id}
                  className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl cursor-pointer transition-all border border-slate-100"
                >
                  <input
                    type="checkbox"
                    value={level.id}
                    {...register("generalLevels")}
                    defaultChecked={data?.curriculum?.some(
                      (item: any) =>
                        item.levelId === level.id && item.streamId === null
                    )}
                    className="w-4 h-4 accent-rubixPurple rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">{level.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ===========================
              SENIOR SCHOOL
          =========================== */}
          <div>
            <h2 className="text-xs font-black text-rubixPurple uppercase tracking-wider mb-3">
              Senior Secondary School
            </h2>
            <div className="space-y-3">
              {seniorLevels.map((level: any) => (
                <div
                  key={level.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3"
                >
                  <label className="flex items-center gap-3 font-bold text-xs text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      value={level.id}
                      {...register("generalLevels")}
                      defaultChecked={data?.curriculum?.some(
                        (item: any) =>
                          item.levelId === level.id && item.streamId === null
                      )}
                      className="w-4 h-4 accent-rubixPurple rounded cursor-pointer"
                    />
                    <span>{level.name} (General / All Streams)</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 ml-6">
                    {streams.map((stream: any) => (
                      <label
                        key={`${level.id}-${stream.id}`}
                        className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          value={`${level.id}-${stream.id}`}
                          {...register("assignments")}
                          defaultChecked={data?.curriculum?.some(
                            (item: any) =>
                              item.levelId === level.id &&
                              item.streamId === stream.id
                          )}
                          className="w-3.5 h-3.5 accent-rubixPurple rounded cursor-pointer"
                        />
                        <span className="truncate">{stream.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ASSIGN TEACHERS */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Assign Teachers
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl ring-[1.5px] ring-gray-200 max-h-48 overflow-y-auto custom-scrollbar">
            {teachers?.map((teacher: any) => (
              <label
                key={teacher.id}
                className="flex items-center gap-2.5 text-xs cursor-pointer bg-white hover:bg-slate-100/60 p-2.5 rounded-xl transition-all border border-slate-100 shadow-2xs"
              >
                <input
                  type="checkbox"
                  value={teacher.id}
                  className="w-4 h-4 rounded accent-rubixPurple shrink-0 cursor-pointer"
                  {...register("teachers")}
                  defaultChecked={data?.teachers?.some(
                    (t: any) => t.id === teacher.id
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-slate-700 font-bold truncate">
                    {teacher.firstName} {teacher.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {teacher.username}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.teachers?.message && (
            <p className="text-[10px] text-red-400 font-medium">
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 z-50 mt-auto">
        {state.error && (
          <span className="text-red-500 text-[10px] block mb-2 text-center font-bold">
            Error saving subject.
          </span>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-3 text-xs md:text-sm font-bold text-slate-400 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-2xl hover:bg-rubixPurple disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{type === "create" ? "Confirm & Create" : "Save Changes"}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubjectForm;