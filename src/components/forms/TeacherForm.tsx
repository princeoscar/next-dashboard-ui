"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, XCircle, ShieldCheck, UserCircle, Briefcase } from "lucide-react";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { subjects?: { id: number; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: data,
  });

  const [img, setImg] = useState<any>(data?.img || null);
  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createTeacher : updateTeacher,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Teacher record ${type === "create" ? "established" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    // Ensure the payload matches what your Server Action and Prisma expect
    const payload = {
      ...formData,
      id: data?.id,
      img: img?.secure_url || img || "", // Handle both new upload and existing image
      // Convert string date from input to Date object for Zod/Prisma
      birthday: formData.birthday ? new Date(formData.birthday) : undefined,
      // Ensure subjects is always an array of IDs
      subjects: Array.isArray(formData.subjects) 
        ? formData.subjects 
        : formData.subjects 
        ? [formData.subjects] 
        : [],
    };

    (formAction as (data: any) => void)(payload);
  });

  const { subjects = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8 p-2" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "Enroll Teacher" : "Edit Faculty"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Staff & Personnel Management
          </p>
        </div>
      </div>

      {/* AUTH SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Access</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
          <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
          <InputField label="Email Address" name="email" type="email" defaultValue={data?.email} register={register} error={errors?.email} />
          <InputField 
            label="Password" 
            name="password" 
            type="password" 
            register={register} 
            error={errors?.password} 
            placeholder={type === "update" ? "Leave blank to keep current" : "••••••••"} 
          />
        </div>
      </div>

      {/* PERSONAL SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <UserCircle size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Profile</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
          <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
          <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
          <InputField label="Contact Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
          <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
          <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />
          <InputField
            label="Date of Birth"
            name="birthday"
            type="date"
            defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
            register={register}
            error={errors.birthday}
          />

          {/* GENDER */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
            <select 
              {...register("sex")} 
              defaultValue={data?.sex}
              className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* SUBJECTS MULTI-SELECT */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Subjects</label>
            <select
              multiple
              {...register("subjects")}
              defaultValue={data?.subjects?.map((s: any) => s.id.toString()) || []}
              className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[55px] scrollbar-hide"
            >
              {subjects.map((subject: any) => (
                <option key={subject.id} value={subject.id.toString()} className="py-1">
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* PHOTO UPLOAD */}
          <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-transparent select-none">Upload</label>
             <CldUploadWidget
                uploadPreset="school"
                onSuccess={(result, { widget }) => {
                  setImg(result.info);
                  widget.close();
                }}
              >
                {({ open }) => (
                  <div 
                    onClick={() => open?.()} 
                    className="flex items-center justify-center gap-3 cursor-pointer p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-white transition-all bg-white/50"
                  >
                    <UploadCloud size={20} className={img ? "text-green-500" : "text-slate-400"} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                      {img ? "Photo Attached" : "Upload Photo"}
                    </span>
                  </div>
                )}
              </CldUploadWidget>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {state.error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-pulse">
          <XCircle size={18} className="text-rose-500" />
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
            Submission error: Please check for duplicate emails or empty fields.
          </span>
        </div>
      )}

      {/* HIDDEN ID */}
      {data && <input type="hidden" {...register("id")} defaultValue={data.id} />}

      <button className="bg-slate-900 hover:bg-indigo-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
        {type === "create" ? "Complete Registration" : "Update Profile"}
      </button>
    </form>
  );
};

export default TeacherForm;