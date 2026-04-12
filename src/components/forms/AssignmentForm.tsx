"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchema";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BookOpenCheck, CalendarClock, Info } from "lucide-react";

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
    resolver: zodResolver(assignmentSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createAssignment : updateAssignment,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
        console.log("Form Data being submitted:", formData);
        startTransition(() => {
          formAction(formData);
        });
      });

  useEffect(() => {
    if (state.success) {
      toast.success(`Success: Assignment ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { lessons } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => formAction(formData))}
    >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Assignment Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors.title}
          placeholder="e.g., Mid-term Calculus Research"
        />

        {/* LESSON SELECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Associated Lesson
          </label>
          <select
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-rubixSky/10 focus:border-rubixSky outline-none transition-all appearance-none"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            <option value="">Select a specific lesson...</option>
            {lessons?.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Release Date"
          name="startDate"
          type="date"
          defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split("T")[0] : ""}
          register={register}
          error={errors.startDate}
        />
        
        <InputField
          label="Submission Deadline"
          name="dueDate"
          type="date"
          defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : ""}
          register={register}
          error={errors.dueDate}
        />

        {/* Hidden ID for updates */}
        {data && <input type="hidden" {...register("id")} defaultValue={data.id} />}
      </div>

      {/* ERROR FEEDBACK */}
      {state.error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
           <div className="bg-rose-500 text-white p-1 rounded-full">
             <Info size={12} />
           </div>
          <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
            Critical Error: Assignment could not be synchronized.
          </p>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <div className="flex items-center justify-between mt-4">
        <div className="hidden md:flex items-center gap-2 text-slate-400">
           <CalendarClock size={16} />
           <span className="text-[10px] font-bold uppercase tracking-tight italic">
             Students will be notified upon publication.
           </span>
        </div>
        
        <button className="group flex items-center justify-center gap-3 bg-slate-900 hover:bg-rubixSky text-white py-4 px-8 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
          {type === "create" ? "Add Assignment" : "Commit Changes"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;