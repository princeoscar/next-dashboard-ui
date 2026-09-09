"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createExam, updateExam } from "@/lib/server-actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { examSchema, ExamSchema } from "@/lib/validation";

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
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      examType: data?.examType,
      totalMarks: data?.totalMarks ?? 100,
      passMark: data?.passMark ?? 40,
      examDate: data?.examDate ? new Date(data.examDate) : undefined,
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      venue: data?.venue ?? "",
      subjectId: data?.subjectId ? Number(data.subjectId) : undefined,
      teacherId: data?.teacherId ?? "",
      id: data?.id ? Number(data.id) : undefined,
      generalLevels:
        data?.targets
          ?.filter((t: any) => t.streamId === null)
          .map((t: any) => String(t.levelId)) ?? [],
      assignments:
        data?.targets
          ?.filter((t: any) => t.streamId !== null)
          .map((t: any) => `${t.levelId}-${t.streamId}`) ?? [],
    },
  });

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
      message: "",
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        state.message ||
        `Exam ${
          type === "create" ? "created" : "updated"
        } successfully!`
      );

      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(state.message || "Something went wrong.");
    }
  }, [state, setOpen, router, type]);

  // Safe data extraction with fallbacks
  let {
    levels = [],
    streams = [],
    subjects = [],
    teachers = [],
    classes = [],
  } = relatedData || {};

  // Fallback: If levels is empty but classes exist, derive levels from classes
  if (levels.length === 0 && classes.length > 0) {
    const levelMap = new Map();
    classes.forEach((c: any) => {
      if (c.level) {
        levelMap.set(c.level.id, c.level);
      } else if (c.levelId) {
        levelMap.set(c.levelId, { id: c.levelId, name: c.levelName || `Level ${c.levelId}` });
      }
    });
    levels = Array.from(levelMap.values());
  }

  // Absolute fallback if both levels and classes are empty structures
  if (levels.length === 0) {
    levels = [
      { id: 1, name: "Junior Secondary 1" },
      { id: 2, name: "Junior Secondary 2" },
      { id: 3, name: "Junior Secondary 3" },
      { id: 4, name: "Senior Secondary 1" },
      { id: 5, name: "Senior Secondary 2" },
      { id: 6, name: "Senior Secondary 3" },
    ];
  }

  const juniorLevels = levels.filter((level: any) => {
    const name = String(level.name || "").toUpperCase();
    return name.includes("JSS") || name.includes("JUNIOR") || name.includes("BASIC") || Number(level.id) <= 3;
  });

  const seniorLevels = levels.filter((level: any) => {
    const name = String(level.name || "").toUpperCase();
    const isSeniorByName =
      (name.includes("SSS") || name.includes("SENIOR") || (name.includes("SS") && !name.includes("JSS"))) ||
      Number(level.id) > 3;

    return isSeniorByName && !juniorLevels.some((j: any) => j.id === level.id);
  });

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = handleSubmit(
    (formData) => {
      startTransition(() => {
        formAction({
          ...formData,
          id: type === "update" ? Number(data?.id) : undefined,
          subjectId: Number(formData.subjectId),
          teacherId: formData.teacherId,
          totalMarks: Number(formData.totalMarks),
          passMark: Number(formData.passMark),
          examDate: new Date(formData.examDate),
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
        });
      });
    },
    (validationErrors) => {
      console.log("EXAM VALIDATION ERRORS:", validationErrors);
    }
  );

  return (
    <form
      className="flex flex-col w-full max-w-2xl mx-auto"
      onSubmit={onSubmit}
    >
      {/* HEADER */}
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-5 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Exam</span>
        </h1>
      </div>

      <div className="px-6 py-6 space-y-8 pb-28">

        {/* UPDATE ID */}
        {type === "update" && data?.id && (
          <input
            type="hidden"
            {...register("id")}
            value={data.id}
            readOnly
          />
        )}

        {/* BASIC INFORMATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Exam Title"
            name="title"
            register={register}
            defaultValue={data?.title}
            error={errors.title}
          />

          <InputField
            label="Exam Date"
            name="examDate"
            type="date"
            register={register}
            defaultValue={
              data?.examDate
                ? new Date(data.examDate).toISOString().slice(0, 10)
                : undefined
            }
            error={errors.examDate}
          />

          <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            register={register}
            defaultValue={formatDateTime(data?.startTime)}
            error={errors.startTime}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            register={register}
            defaultValue={formatDateTime(data?.endTime)}
            error={errors.endTime}
          />

          <InputField
            label="Total Marks"
            name="totalMarks"
            type="number"
            register={register}
            defaultValue={data?.totalMarks ?? 100}
            error={errors.totalMarks}
          />

          <InputField
            label="Pass Mark"
            name="passMark"
            type="number"
            register={register}
            defaultValue={data?.passMark ?? 40}
            error={errors.passMark}
          />
        </div>

        {/* SUBJECT */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Subject
          </label>

          <select
            {...register("subjectId")}
            defaultValue={data?.subjectId ?? ""}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject: any) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          {errors.subjectId?.message && (
            <p className="text-xs text-red-500">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>

        {/* EXAM TYPE */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Exam Type
          </label>

          <select
            {...register("examType")}
            defaultValue={data?.examType ?? ""}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            <option value="">Select Exam Type</option>
            <option value="CA">CA</option>
            <option value="MID_TERM">Mid Term</option>
            <option value="TERMINAL">Terminal</option>
            <option value="MOCK">Mock</option>
            <option value="PRACTICAL">Practical</option>
            <option value="CBT">CBT</option>
          </select>

          {errors.examType?.message && (
            <p className="text-xs text-red-500">
              {errors.examType.message.toString()}
            </p>
          )}
        </div>

        {/* TARGET CLASSES (Matching SubjectForm Checkbox Architecture) */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-black text-slate-700 uppercase">
              Target Classes
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select general levels or specific SSS streams (e.g., Science for Physics) to receive this exam.
            </p>
          </div>

          {/* JUNIOR SECONDARY SCHOOL */}
          <div>
            <h3 className="font-black text-rubixPurple uppercase mb-4 text-sm">
              Junior Secondary School
            </h3>

            <div className="space-y-3">
              {juniorLevels.map((level: any) => (
                <label
                  key={level.id}
                  className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl cursor-pointer hover:bg-slate-100 transition"
                >
                  <input
                    type="checkbox"
                    value={level.id}
                    {...register("generalLevels")}
                    defaultChecked={
                      data?.targets?.some(
                        (item: any) =>
                          item.levelId === level.id &&
                          item.streamId === null
                      )
                    }
                    className="w-4 h-4 rounded accent-rubixPurple cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">{level.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SENIOR SECONDARY SCHOOL */}
          <div>
            <h3 className="font-black text-rubixPurple uppercase mb-4 text-sm">
              Senior Secondary School
            </h3>

            <div className="space-y-6">
              {seniorLevels.map((level: any) => (
                <div
                  key={level.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* General Level Checkbox */}
                  <label className="flex items-center gap-3 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      value={level.id}
                      {...register("generalLevels")}
                      defaultChecked={
                        data?.targets?.some(
                          (item: any) =>
                            item.levelId === level.id &&
                            item.streamId === null
                        )
                      }
                      className="w-4 h-4 rounded accent-rubixPurple cursor-pointer"
                    />
                    <span>{level.name} (General)</span>
                  </label>

                  {/* Streams Grid (Art, Science, Commercial) */}
                  <div className="grid grid-cols-2 gap-3 mt-5 ml-7">
                    {streams.map((stream: any) => (
                      <label
                        key={`${level.id}-${stream.id}`}
                        className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-rubixPurple transition"
                      >
                        <input
                          type="checkbox"
                          value={`${level.id}-${stream.id}`}
                          {...register("assignments")}
                          defaultChecked={
                            data?.targets?.some(
                              (item: any) =>
                                item.levelId === level.id &&
                                item.streamId === stream.id
                            )
                          }
                          className="w-4 h-4 rounded accent-rubixPurple cursor-pointer"
                        />
                        <span>{stream.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TEACHER */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Teacher
          </label>

          <select
            {...register("teacherId")}
            defaultValue={data?.teacherId ?? ""}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher: any) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>

          {errors.teacherId?.message && (
            <p className="text-xs text-red-500">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>

        {/* VENUE */}
        <InputField
          label="Venue"
          name="venue"
          register={register}
          defaultValue={data?.venue ?? ""}
          error={errors.venue}
        />

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Description
          </label>

          <textarea
            {...register("description")}
            defaultValue={data?.description ?? ""}
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none"
            placeholder="Optional exam description..."
          />

          {errors.description?.message && (
            <p className="text-xs text-red-500">
              {errors.description.message.toString()}
            </p>
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        {state.error && (
          <p className="text-sm text-red-500 mb-3 text-center">
            {state.message || "Something went wrong."}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg disabled:opacity-50"
        >
          {isPending
            ? type === "create"
              ? "Creating..."
              : "Updating..."
            : type === "create"
            ? "Create Exam"
            : "Update Exam"}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;