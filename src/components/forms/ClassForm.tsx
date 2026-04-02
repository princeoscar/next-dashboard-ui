"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchema";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { School, Users, GraduationCap } from "lucide-react";

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
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: data, // Populates name, capacity, etc. automatically
  });

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createClass : updateClass,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers, grades } = relatedData || { teachers: [], grades: [] };

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        (formAction as (data: ClassSchema) => void)(formData);
      })}
    >
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <School size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "New Class" : "Edit Class"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Academic Structure Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <InputField
          label="Class Name (e.g., 10A)"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <InputField
          label="Student Capacity"
          name="capacity"
          type="number"
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
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Supervisor (Teacher)
          </label>
          <div className="relative group">
            <select
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
              {...register("supervisorId")}
              defaultValue={data?.supervisorId}
            >
              <option value="">Select a supervisor</option>
              {teachers.map((t: any) => (
                <option value={t.id} key={t.id}>
                  {t.name} {t.surname}
                </option>
              ))}
            </select>
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          {errors.supervisorId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>

        {/* GRADE SELECT */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Grade Level
          </label>
          <div className="relative group">
            <select
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
              {...register("gradeId", { valueAsNumber: true })}
              defaultValue={data?.gradeId}
            >
              <option value="">Select grade level</option>
              {grades.map((g: any) => (
                <option value={g.id} key={g.id}>
                  Grade {g.level}
                </option>
              ))}
            </select>
            <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          {errors.gradeId?.message && (
            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide ml-1">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
             <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
               Update Failed: Please check your permissions
             </span>
          </div>
        )}
        
        <button className="bg-slate-900 hover:bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
          {type === "create" ? "Create Class" : "Update Class"}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;