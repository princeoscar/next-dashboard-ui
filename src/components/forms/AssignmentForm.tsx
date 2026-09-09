"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  Dispatch,
  SetStateAction,
  useTransition,
} from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/validation";
import { createAssignment, updateAssignment } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  BookOpenCheck,
  CalendarClock,
  Info,
} from "lucide-react";

type CurrentState = {
  success: boolean;
  error: boolean;
  message?: string;
};

const AssignmentForm = ({
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
  } = useForm<AssignmentSchema>({
    // @ts-ignore
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      instructions: data?.instructions ?? "",
      attachmentUrl: data?.attachmentUrl ?? "",
      totalMarks: data?.totalMarks ?? 20,

      assignedDate: data?.assignedDate
        ? new Date(data.assignedDate)
        : undefined,

      dueDate: data?.dueDate
        ? new Date(data.dueDate)
        : undefined,

      subjectId: data?.subjectId
        ? Number(data.subjectId)
        : undefined,

      teacherId: data?.teacherId ?? "",
      id: data?.id ? Number(data.id) : undefined,
    },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    subjects = [],
    teachers = [],
    levels = [],
    classes = [],
    streams = [],
  } = relatedData || {};

  const juniorLevels = levels.filter((level: any) =>
    String(level.name).toUpperCase().startsWith("JSS")
  );

  const seniorLevels = levels.filter((level: any) =>
    String(level.name).toUpperCase().startsWith("SSS")
  );

  const onSubmit = handleSubmit(async (formData) => {
    const selectedClassIds = new Set<string>();

    // Parse the checkbox selections (LEVEL-*, GENERAL-*, CLASS-*)
    for (const selection of (formData as any).classes || []) {
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
      id: type === "update" ? Number(data?.id) : undefined,
      classes: resolvedClasses,
      description: formData.description || null,
      instructions: formData.instructions || null,
      attachmentUrl: formData.attachmentUrl || null,
      totalMarks: Number(formData.totalMarks),
      subjectId: Number(formData.subjectId),
      teacherId: formData.teacherId,
      assignedDate: formData.assignedDate
        ? new Date(formData.assignedDate)
        : undefined,
      dueDate: new Date(formData.dueDate),
    };

    startTransition(async () => {
      const currentState = { success: false, error: false, message: "" };

      const res =
        type === "create"
          ? await createAssignment(currentState, payload as any)
          : await updateAssignment(currentState, payload as any);

      if (res.success) {
        toast.success(
          res.message ||
            `Assignment ${
              type === "create" ? "created" : "updated"
            } successfully!`
        );
        setOpen(false);
        router.refresh();
      } else if (res.error) {
        toast.error(res.message || "Something went wrong.");
      }
    });
  });

  return (
    <form className="flex flex-col gap-8 p-2" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-rubixSky/10 text-rubixSky rounded-2xl">
          <BookOpenCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "Define Task" : "Edit Task"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Academic Assignments & Deliverables
          </p>
        </div>
      </div>

      {/* BASIC INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Assignment Title"
          name="title"
          register={register}
          error={errors.title}
          placeholder="e.g., Mid-term Chemistry Research"
        />

        {/* SUBJECT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Associated Subject
          </label>
          <select
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all appearance-none"
            defaultValue={data?.subjectId}
            {...register("subjectId")}
          >
            <option value="">Select a specific subject...</option>
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>

        {/* INSTRUCTIONS */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Assignment Content & Instructions
          </label>
          <textarea
            {...register("instructions")}
            rows={6}
            placeholder="Write assignment questions and requirements here..."
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium resize-y focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all leading-6"
          />
          {errors.instructions?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.instructions.message.toString()}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Description <span className="text-slate-300 ml-2 normal-case tracking-normal">Optional</span>
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="Briefly describe what this assignment is about..."
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium resize-y focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all"
          />
        </div>

        {/* RELEASE DATE */}
        <InputField
          label="Release Date"
          name="assignedDate"
          type="date"
          register={register}
          error={errors.assignedDate}
        />

        {/* DUE DATE */}
        <InputField
          label="Submission Deadline"
          name="dueDate"
          type="date"
          register={register}
          error={errors.dueDate}
        />

        {/* TOTAL MARKS */}
        <InputField
          label="Total Marks"
          name="totalMarks"
          type="number"
          register={register}
          error={errors.totalMarks}
        />
      </div>

      {/* TARGET CLASSES / LEVELS SELECTION */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Target Classes & Streams
        </label>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-6">
          {/* JUNIOR SECONDARY SCHOOL */}
          <div>
            <h3 className="text-sm font-black text-rubixPurple uppercase mb-3">
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
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-rubixPurple transition-all"
                  >
                    <input
                      type="checkbox"
                      value={`LEVEL-${level.id}`}
                      {...register("classes" as any)}
                      className="w-4 h-4 accent-rubixPurple"
                    />
                    <span className="font-bold text-slate-700">{level.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SENIOR SECONDARY SCHOOL */}
          <div>
            <h3 className="text-sm font-black text-rubixPurple uppercase mb-3">
              Senior Secondary School
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div key={level.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 mb-4">{level.name}</h4>
                    <div className="space-y-3">
                      {generalClass && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={`GENERAL-${level.id}`}
                            {...register("classes" as any)}
                            className="w-4 h-4 accent-rubixPurple"
                          />
                          <span className="text-sm text-slate-600">General</span>
                        </label>
                      )}

                      {streamClasses.map((classItem: any) => {
                        const stream = streams.find(
                          (s: any) => Number(s.id) === Number(classItem.streamId)
                        );
                        if (!stream) return null;

                        return (
                          <label key={classItem.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              value={`CLASS-${classItem.id}`}
                              {...register("classes" as any)}
                              className="w-4 h-4 accent-rubixPurple"
                            />
                            <span className="text-sm text-slate-600">{stream.name}</span>
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

        {(errors as any).classes?.message && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
            {(errors as any).classes.message.toString()}
          </p>
        )}
        <p className="text-[10px] text-slate-400 ml-1">
          Select a JSS level to target all classes, or select specific SSS streams (e.g. Science, Art) individually.
        </p>
      </div>

      {/* TEACHER */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
          Assigning Teacher
        </label>
        <select
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium"
          defaultValue={data?.teacherId}
          {...register("teacherId")}
        >
          <option value="">Select a teacher...</option>
          {teachers.map((teacher: any) => (
            <option value={teacher.id} key={teacher.id}>
              {teacher.firstName} {teacher.lastName}
            </option>
          ))}
        </select>
        {errors.teacherId?.message && (
          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
            {errors.teacherId.message.toString()}
          </p>
        )}
      </div>

      {/* SUBMIT */}
      <div className="flex items-center justify-between mt-4">
        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <CalendarClock size={16} />
          <span className="text-[10px] font-bold uppercase tracking-tight italic">
            Students will be notified upon publication.
          </span>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="group flex items-center justify-center gap-3 bg-slate-900 hover:bg-rubixSky text-white py-4 px-8 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          {isPending
            ? type === "create"
              ? "Creating..."
              : "Saving..."
            : type === "create"
            ? "Add Assignment"
            : "Commit Changes"}
        </button>
      </div>
    </form>
  );
};



export default AssignmentForm;