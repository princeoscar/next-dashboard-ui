"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useActionState, useEffect } from "react";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchema";
import { useFormStatus } from "react-dom";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Contact, ShieldCheck, UserCircle, MapPin, GraduationCap, Mail, Lock } from "lucide-react";

// Consistency check: Reuse your loading button component
const SubmitButton = ({ type }: { type: "create" | "update" }) => {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="bg-slate-900 hover:bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed"
    >
      {pending ? "Processing..." : type === "create" ? "Add Parent" : "Save Changes"}
    </button>
  );
};

const ParentForm = ({
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
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema) as any,
    defaultValues: data,
  });

  const router = useRouter();

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );

  // ✅ MOVED ALL SUCCESS LOGIC HERE
  useEffect(() => {
    if (state.success) {
      toast.success(
        type === "create" 
          ? "Parent created! You can now assign them to a student." 
          : "Parent updated successfully!"
      );
      setOpen(false);
      router.refresh();
      
      if (type === "create") {
        router.push("/list/students");
      }
    }
  }, [state.success, router, type, setOpen]);

  const { students } = relatedData || {};

  return (
    <form 
      className="flex flex-col gap-8 p-2" 
      onSubmit={handleSubmit((formData) => {
        (formAction as (data: any) => void)({ 
          ...formData, 
          id: data?.id 
        });
      })}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
          {type === "create" ? "Register Parent" : "Edit Parent Profile"}
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {type === "create" ? "Create a new guardian account" : `Modifying records for ${data?.name}`}
        </p>
      </div>

      {/* AUTHENTICATION SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Authentication
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            register={register}
            error={errors?.username}
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            defaultValue={data?.email}
            register={register}
            error={errors?.email}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            defaultValue={data?.password}
            register={register}
            error={errors?.password}
          />
        </div>
      </div>

      {/* PERSONAL SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <UserCircle size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Personal Details
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
          <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
          <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
          <InputField label="Contact Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
          <InputField label="Residential Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />

          {/* STUDENT LINK SELECT */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Associated Student
            </label>
            <div className="relative group">
              <select
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                {...register("studentId")}
                defaultValue={data?.studentId}
              >
                <option value="">Select a student</option>
                {students?.map((student: { id: string; name: string; surname: string }) => (
                  <option value={student.id} key={student.id}>
                    {student.name} {student.surname}
                  </option>
                ))}
              </select>
              <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>
            {errors.studentId?.message && (
              <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              Error: Check for duplicate email or username
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin size={14} />
            <p className="text-[10px] font-bold uppercase tracking-tight italic">
              Linking a student ensures parent dashboard access.
            </p>
          </div>

          <SubmitButton type={type} />
        </div>
      </div>
    </form>
  );
};

export default ParentForm;