"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchema";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BookOpen, Users, Info, Sparkles } from "lucide-react";

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
    defaultValues: data,
  });

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createSubject : updateSubject,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        // Essential cast to resolve ts(2554)
        (formAction as (data: SubjectSchema) => void)(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl shadow-sm">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Subject" : "Edit Subject"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Academic Curriculum Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          placeholder="e.g. Advanced Physics"
          register={register}
          error={errors?.name}
        />

        {data && (
          <input type="hidden" {...register("id")} defaultValue={data.id} />
        )}

        {/* TEACHERS MULTI-SELECT */}
        <div className="flex flex-col gap-2 md:col-span-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Assign Teachers
          </label>
          <div className="relative group">
            <select
              multiple
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all min-h-[120px] scrollbar-thin scrollbar-thumb-slate-200"
              {...register("teachers")}
              defaultValue={data?.teachers}
            >
              {teachers?.map((teacher: { id: string; name: string; surname: string }) => (
                <option 
                  value={teacher.id} 
                  key={teacher.id}
                  className="p-2 rounded-lg checked:bg-violet-50 checked:text-violet-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {teacher.name} {teacher.surname}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 text-slate-300 pointer-events-none group-focus-within:text-violet-500 transition-colors">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 ml-1">
            <Info size={12} className="text-slate-400" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
              Hold Cmd/Ctrl to select multiple educators
            </p>
          </div>
          {errors.teachers?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.teachers.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              Sync Error: Subject already exists or invalid teacher IDs
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles size={14} className="text-violet-400" />
            <p className="text-[10px] font-bold uppercase tracking-tight italic">
              New subjects will be available for lesson scheduling immediately.
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-violet-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
            {type === "create" ? "Establish Subject" : "Update Subject"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubjectForm;