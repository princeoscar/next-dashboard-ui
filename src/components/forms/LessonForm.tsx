"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition, useState } from "react";
import { lessonSchema, LessonSchema } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/server-actions";

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
    // @ts-ignore
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false, message: "" }
  );

  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const {
    subjects = [],
    classes = [],
    teachers = [],
    levels = [],
    streams = [],
  } = relatedData || {};

  useEffect(() => {
    if (state.success) {
      toast.success(`Timetable has been ${type === "create" ? "created" : "modified"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    setIsPending(true);
    const selectedSubject = subjects.find(
      (s: any) => Number(s.id) === Number(formData.subjectId)
    );

    const selectedClassIds = new Set<string>();

    for (const selection of formData.classes) {
      if (selection.startsWith("LEVEL-")) {
        const levelId = Number(selection.replace("LEVEL-", ""));
        classes.forEach((c: any) => {
          if (Number(c.levelId) === levelId) {
            selectedClassIds.add(String(c.id));
          }
        });
        continue;
      }

      if (selection.startsWith("GENERAL-")) {
        const levelId = Number(selection.replace("GENERAL-", ""));
        classes.forEach((c: any) => {
          if (
            Number(c.levelId) === levelId &&
            (c.streamId === null || c.streamId === undefined)
          ) {
            selectedClassIds.add(String(c.id));
          }
        });
        continue;
      }

      if (selection.startsWith("CLASS-")) {
        const classId = Number(selection.replace("CLASS-", ""));
        const selectedClass = classes.find(
          (c: any) => Number(c.id) === classId
        );
        if (selectedClass) {
          selectedClassIds.add(String(selectedClass.id));
        }
        continue;
      }
    }

    const resolvedClasses = Array.from(selectedClassIds);

    const payload = {
      ...formData,
      id: data?.id,
      classes: resolvedClasses,
      title:
        formData.title ||
        selectedSubject?.name ||
        "New Period",
    };

    startTransition(() => {
      formAction(payload);
      setIsPending(false);
    });
  });

  const juniorLevels = levels?.filter(
    (level: any) =>
      level.name.toUpperCase().startsWith("JSS")
  );

  const seniorLevels = levels?.filter(
    (level: any) =>
      level.name.toUpperCase().startsWith("SSS")
  );

  return (
    <form 
      className="flex flex-col w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar text-center" 
      onSubmit={onSubmit}
    >
      {/* STICKY HEADER */}
      <div className="sticky top-0 bg-white z-50 px-6 pt-6 pb-4 border-b border-slate-100 text-center">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Add to" : "Update"}{" "}
          <span className="text-rubixPurple">Timetable</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Assign subjects to classes and teachers
        </p>
      </div>

      <div className="px-6 py-6 space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* DESCRIPTION */}
          <InputField
            label="Period Description (Optional)"
            name="title"
            defaultValue={data?.title}
            register={register}
            error={errors.title}
            placeholder="e.g. Algebra Intro"
          />

          {/* DAY OF WEEK */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Day of Week
            </label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-2xl text-xs md:text-sm w-full focus:ring-2 focus:ring-rubixPurple outline-none transition-all bg-white"
              {...register("day")}
              defaultValue={data?.day}
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
            </select>
            {errors.day?.message && (
              <p className="text-[10px] text-red-500 font-medium">
                {errors.day.message.toString()}
              </p>
            )}
          </div>
        </div>

        {/* TIME SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Start Time"
            name="startTime"
            type="time"
            defaultValue={data?.startTime}
            register={register}
            error={errors.startTime}
          />
          <InputField
            label="End Time"
            name="endTime"
            type="time"
            defaultValue={data?.endTime}
            register={register}
            error={errors.endTime}
          />
        </div>

        {/* RELATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SUBJECT */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Subject
            </label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-2xl text-xs md:text-sm focus:ring-2 focus:ring-rubixPurple outline-none bg-white w-full"
              {...register("subjectId")}
              defaultValue={data?.subjectId}
            >
              <option value="">Select Subject</option>
              {subjects?.map((s: any) => (
                <option value={s.id} key={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subjectId?.message && (
              <p className="text-[10px] text-red-500 font-medium">
                {errors.subjectId.message.toString()}
              </p>
            )}
          </div>

          {/* TEACHER */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Teacher
            </label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-2xl text-xs md:text-sm focus:ring-2 focus:ring-rubixPurple outline-none bg-white w-full"
              {...register("teacherId")}
              defaultValue={data?.teacherId || ""}
            >
              <option value="">Select Teacher</option>
              {teachers?.map((teacher: any) => (
                <option value={teacher.id} key={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            {errors.teacherId?.message && (
              <p className="text-[10px] text-red-500 font-medium">
                {errors.teacherId.message.toString()}
              </p>
            )}
          </div>
        </div>

        {/* TARGET CLASSES */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Target Classes
          </label>
          <div className="bg-slate-50 rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5 space-y-6">
            {/* JUNIOR SECONDARY SCHOOL */}
            <div>
              <h3 className="text-xs font-black text-rubixPurple uppercase tracking-wider mb-3">
                Junior Secondary School
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {juniorLevels.map((level: any) => {
                  const levelClasses = classes.filter(
                    (c: any) => Number(c.levelId) === Number(level.id)
                  );
                  if (levelClasses.length === 0) return null;

                  return (
                    <label
                      key={level.id}
                      className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 cursor-pointer hover:border-rubixPurple transition-all"
                    >
                      <input
                        type="checkbox"
                        value={`LEVEL-${level.id}`}
                        {...register("classes")}
                        className="w-4 h-4 accent-rubixPurple rounded cursor-pointer shrink-0"
                      />
                      <span className="font-bold text-xs text-slate-700">
                        {level.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SENIOR SECONDARY SCHOOL */}
            <div>
              <h3 className="text-xs font-black text-rubixPurple uppercase tracking-wider mb-3">
                Senior Secondary School
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {seniorLevels.map((level: any) => {
                  const levelClasses = classes.filter(
                    (c: any) => Number(c.levelId) === Number(level.id)
                  );
                  if (levelClasses.length === 0) return null;

                  const generalClass = levelClasses.find(
                    (c: any) => c.streamId === null || c.streamId === undefined
                  );
                  const streamClasses = levelClasses.filter(
                    (c: any) => c.streamId !== null && c.streamId !== undefined
                  );

                  return (
                    <div
                      key={level.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
                    >
                      <h4 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2">
                        {level.name}
                      </h4>
                      <div className="space-y-2.5">
                        {generalClass && (
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                            <input
                              type="checkbox"
                              value={`GENERAL-${level.id}`}
                              {...register("classes")}
                              className="w-4 h-4 accent-rubixPurple rounded cursor-pointer shrink-0"
                            />
                            <span className="text-slate-600 font-medium">General</span>
                          </label>
                        )}
                        {streamClasses.map((classItem: any) => {
                          const stream = streams.find(
                            (s: any) => Number(s.id) === Number(classItem.streamId)
                          );
                          if (!stream) return null;

                          return (
                            <label
                              key={classItem.id}
                              className="flex items-center gap-2.5 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                value={`CLASS-${classItem.id}`}
                                {...register("classes")}
                                className="w-4 h-4 accent-rubixPurple rounded cursor-pointer shrink-0"
                              />
                              <span className="text-slate-600 font-medium truncate">
                                {stream.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic px-1 mt-1">
            Select a JSS level to target all classes, or choose specific SSS streams.
          </p>
          {errors.classes?.message && (
            <p className="text-[10px] text-red-500 font-medium">
              {errors.classes.message.toString()}
            </p>
          )}
        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 z-50 mt-auto flex items-center justify-end gap-3">
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
            <span>{type === "create" ? "Confirm Schedule" : "Update Schedule"}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;