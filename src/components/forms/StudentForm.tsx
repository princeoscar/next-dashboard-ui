"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";
import { useFormState } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { 
  UserPlus, 
  ShieldCheck, 
  UserCircle, 
  UploadCloud, 
  GraduationCap, 
  School,
  XCircle,
  CheckCircle2
} from "lucide-react";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: data,
  });

  const [img, setImg] = useState<any>(data?.img || null);
  const router = useRouter();

  const [state, formAction] = useFormState<any, any>(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    const imageUrl = typeof img === "string" ? img : img?.secure_url;
    (formAction as (data: StudentSchema & { img?: string }) => void)({
      ...formData,
      img: imageUrl,
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Student record ${type === "create" ? "established" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades = [], classes = [] } = relatedData || {};

  if (type === "create" && (!relatedData || grades.length === 0)) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Academy Data...</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-10 p-4 max-w-5xl mx-auto" onSubmit={onSubmit}>
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">
            <UserPlus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              {type === "create" ? "Enroll Student" : "Update Profile"}
            </h1>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Student Information System
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* SECTION 1: CREDENTIALS */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <ShieldCheck size={18} className="text-blue-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Access</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
            <InputField label="Email Address" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
            <InputField label="Password" name="password" type="password" register={register} error={errors?.password} placeholder="••••••••" />
          </div>
        </section>

        {/* SECTION 2: PERSONAL PROFILE */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <UserCircle size={18} className="text-blue-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Personal Profile</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
            <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
            <InputField label="Phone Number" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
            <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />
            <InputField
              label="Date of Birth"
              name="birthday"
              type="date"
              defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
              register={register}
              error={errors.birthday}
            />
            <InputField label="Parent ID" name="parentId" defaultValue={data?.parentId} register={register} error={errors.parentId} />
            
            <div className="lg:col-span-2">
              <InputField label="Residential Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sex</label>
              <select 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer hover:border-slate-300" 
                {...register("sex")} 
                defaultValue={data?.sex}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 3: ACADEMICS & PHOTO */}
        <section className="bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <School size={18} className="text-blue-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Academic Placement</h2>
            <div className="h-px flex-1 bg-slate-200/50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* GRADE */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grade Level</label>
              <div className="relative">
                <select className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none" {...register("gradeId", { valueAsNumber: true })} defaultValue={data?.gradeId}>
                  {grades.map((grade: any) => (
                    <option value={grade.id} key={grade.id}>Grade {grade.level}</option>
                  ))}
                </select>
                <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>

            {/* CLASS */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Class Assigned</label>
              <select className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none" {...register("classId", { valueAsNumber: true })} defaultValue={data?.classId}>
                {classes.map((c: any) => (
                  <option value={c.id} key={c.id}>{c.name} ({c._count.students}/{c.capacity})</option>
                ))}
              </select>
            </div>

            {/* PHOTO UPLOAD */}
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => { setImg(result.info); widget.close(); }}
            >
              {({ open }) => (
                <div 
                  onClick={() => open?.()} 
                  className={`flex items-center justify-center gap-3 cursor-pointer p-3.5 rounded-2xl border-2 border-dashed transition-all bg-white h-[55px] ${img ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"}`}
                >
                  {img ? <CheckCircle2 size={20} className="text-emerald-500" /> : <UploadCloud size={20} className="text-slate-400" />}
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${img ? "text-emerald-600" : "text-slate-500"}`}>
                    {img ? "Photo Attached" : "Upload Profile"}
                  </span>
                </div>
              )}
            </CldUploadWidget>
          </div>
        </section>
      </div>

      {/* ERROR FEEDBACK */}
      {state.error && (
        <div className="flex items-center gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
          <XCircle size={20} className="text-rose-500" />
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            {state.message || "Entry Error: Please verify all mandatory student data."}
          </p>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-10">
        <button 
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-800 font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
        >
          Cancel Enrollment
        </button>
        
        <button type="submit" className="bg-slate-900 hover:bg-blue-600 text-white py-5 px-12 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 transition-all active:scale-95">
          {type === "create" ? "Complete Enrollment" : "Update Records"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;