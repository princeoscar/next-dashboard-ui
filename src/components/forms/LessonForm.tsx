"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect, startTransition } from "react";
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<LessonSchema>({
    // @ts-ignore
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false, message: "" }
  );

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
      toast.success(`Timetable has been ${type === "create" ? "updated" : "modified"}!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    const selectedSubject = subjects.find(
      (s: any) => Number(s.id) === Number(formData.subjectId)
    );

    const selectedClassIds = new Set<string>();

for (const selection of formData.classes) {

  // ==========================================
  // JSS LEVEL-WIDE SELECTION
  // Example: LEVEL-7
  // Selects every class belonging to JSS 1
  // ==========================================
  if (selection.startsWith("LEVEL-")) {
    const levelId = Number(selection.replace("LEVEL-", ""));

    classes.forEach((c: any) => {
      if (Number(c.levelId) === levelId) {
        selectedClassIds.add(String(c.id));
      }
    });

    continue;
  }

  // ==========================================
  // SSS GENERAL
  // Example: GENERAL-10
  // ==========================================
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

  // ==========================================
  // INDIVIDUAL CLASS
  // Example: CLASS-25
  // Used for SSS Science / Art / Commercial
  // ==========================================
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

console.log("========== LESSON SUBMISSION ==========");
console.log("Selected groups:", formData.classes);
console.log("Resolved class IDs:", resolvedClasses);
console.log("Subject:", selectedSubject?.name);
console.log("Teacher:", formData.teacherId);
console.log("========================================");

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
    <form className="flex flex-col w-full max-w-2xl mx-auto mt-6 text-center" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Add to" : "Update"} <span className="text-blue-500">Timetable</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Assign subjects to classes and teachers</p>
      </div>

      <div className="px-6 py-6 space-y-8">

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
          <div className="flex flex-col gap-2 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase">Day of Week</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-400 outline-none transition-all bg-white"
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
              <p className="text-[10px] text-red-500">{errors.day.message.toString()}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* SUBJECT */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
            <select
              className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
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
              <p className="text-[10px] text-red-500">{errors.subjectId.message.toString()}</p>
            )}
          </div>

          {/* TARGET CLASSES */}
<div className="md:col-span-2 flex flex-col gap-3">

  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
    Target Classes
  </label>

  <div className="bg-slate-50 rounded-2xl ring-1 ring-slate-200 p-5 space-y-6">

    {/* =========================
        JUNIOR SECONDARY SCHOOL
    ========================== */}
    <div>
  <h3 className="text-sm font-black text-rubixPurple uppercase mb-3">
    Junior Secondary School
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {juniorLevels.map((level: any) => {
      const levelClasses = classes.filter(
        (c: any) =>
          Number(c.levelId) === Number(level.id)
      );

      if (levelClasses.length === 0) {
        return null;
      }

      return (
        <label
          key={level.id}
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-rubixPurple transition-all"
        >
          <input
            type="checkbox"
            value={`LEVEL-${level.id}`}
            {...register("classes")}
            className="w-4 h-4 accent-rubixPurple"
          />

          <span className="font-semibold text-slate-700">
            {level.name}
          </span>
        </label>
      );
    })}
  </div>
</div>


    {/* =========================
        SENIOR SECONDARY SCHOOL
    ========================== */}
    <div>

  <h3 className="text-sm font-black text-rubixPurple uppercase mb-3">
    Senior Secondary School
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {seniorLevels.map((level: any) => {

      const levelClasses = classes.filter(
        (c: any) =>
          Number(c.levelId) === Number(level.id)
      );

      if (levelClasses.length === 0) {
        return null;
      }

      const generalClass = levelClasses.find(
        (c: any) =>
          c.streamId === null ||
          c.streamId === undefined
      );

      const streamClasses = levelClasses.filter(
        (c: any) =>
          c.streamId !== null &&
          c.streamId !== undefined
      );

      return (
        <div
          key={level.id}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >

          <h4 className="font-bold text-slate-800 mb-4">
            {level.name}
          </h4>

          <div className="space-y-3">

            {/* ==========================
                GENERAL
            =========================== */}
            {generalClass && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={`GENERAL-${level.id}`}
                  {...register("classes")}
                  className="w-4 h-4 accent-rubixPurple"
                />

                <span className="text-sm text-slate-600">
                  General
                </span>
              </label>
            )}

            {/* ==========================
                STREAMS
            =========================== */}
            {streamClasses.map((classItem: any) => {

              const stream = streams.find(
                (s: any) =>
                  Number(s.id) === Number(classItem.streamId)
              );

              if (!stream) {
                return null;
              }

              return (
                <label
                  key={classItem.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={`CLASS-${classItem.id}`}
                    {...register("classes")}
                    className="w-4 h-4 accent-rubixPurple"
                  />

                  <span className="text-sm text-slate-600">
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

  <p className="text-[10px] text-slate-400 italic px-1">
    Select a JSS level to teach all classes in that level, or select
    individual SSS streams such as Science, Art, or Commercial.
  </p>

  {errors.classes?.message && (
    <p className="text-[10px] text-red-500">
      {errors.classes.message.toString()}
    </p>
  )}

</div>

          {/* TEACHER */}
         <div className="flex flex-col gap-2">
  <label className="text-xs font-bold text-slate-500 uppercase">
    Teacher
  </label>

  <select
    className="ring-1 ring-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
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
    <p className="text-[10px] text-red-500">
      {errors.teacherId.message.toString()}
    </p>
  )}
</div>
        </div>
      </div>

      {/* FOOTER BUTTON */}
      <div className="shrink-0 bg-white px-6 py-4 border-t border-slate-100">
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95">
          {type === "create" ? "Confirm Schedule" : "Update Schedule"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;