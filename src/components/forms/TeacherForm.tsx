"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { 
  UploadCloud, 
  XCircle, 
  ShieldCheck, 
  UserCircle, 
  Briefcase,
  CheckCircle2
} from "lucide-react";

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
    const payload = {
      ...formData,
      id: data?.id,
      img: img?.secure_url || img || "",
      birthday: formData.birthday ? new Date(formData.birthday) : undefined,
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
    <form className="flex flex-col gap-10 p-4 max-w-5xl mx-auto" onSubmit={onSubmit}>
      {/* HEADER: Professional Branding */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              {type === "create" ? "Enroll Teacher" : "Edit Faculty"}
            </h1>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Staff & Personnel Management
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-14">
        {/* SECTION 1: AUTHENTICATION */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <ShieldCheck size={18} className="text-indigo-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Access</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
            <InputField label="Email Address" name="email" type="email" defaultValue={data?.email} register={register} error={errors?.email} />
            <InputField 
              label="Password" 
              name="password" 
              type="password" 
              register={register} 
              error={errors?.password} 
              placeholder={type === "update" ? "••••••••" : "••••••••"} 
            />
          </div>
        </section>

        {/* SECTION 2: PERSONAL DATA */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <UserCircle size={18} className="text-indigo-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Personal Profile</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
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

            {/* GENDER SELECTION */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Identity</label>
              <select 
                {...register("sex")} 
                defaultValue={data?.sex}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer hover:border-slate-300"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* SUBJECTS MULTI-SELECT */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Subjects</label>
              <select
                multiple
                {...register("subjects")}
                defaultValue={data?.subjects?.map((s: any) => s.id.toString()) || []}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none min-h-[55px] scrollbar-hide"
              >
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id.toString()}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* PHOTO UPLOAD WIDGET */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-transparent select-none">Spacer</label>
              <CldUploadWidget
                uploadPreset="school"
                onSuccess={(result, { widget }) => { setImg(result.info); widget.close(); }}
              >
                {({ open }) => (
                  <div 
                    onClick={() => open?.()} 
                    className={`flex items-center justify-center gap-3 cursor-pointer p-3.5 rounded-2xl border-2 border-dashed transition-all bg-white ${img ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"}`}
                  >
                    {img ? <CheckCircle2 size={20} className="text-emerald-500" /> : <UploadCloud size={20} className="text-slate-400" />}
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${img ? "text-emerald-600" : "text-slate-500"}`}>
                      {img ? "Identity Verified" : "Upload Credentials"}
                    </span>
                  </div>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </section>
      </div>

      {/* ERROR FEEDBACK */}
      {state.error && (
        <div className="flex items-center gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100">
          <XCircle size={20} className="text-rose-500" />
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Critical Error: Please ensure all mandatory fields are populated correctly.
          </p>
        </div>
      )}

      {/* FOOTER: Primary Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-10">
        <button 
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-800 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          Discard Changes
        </button>
        
        <button className="bg-slate-900 hover:bg-indigo-600 text-white py-5 px-12 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3">
          {type === "create" ? "Establish Record" : "Finalize Profile"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;