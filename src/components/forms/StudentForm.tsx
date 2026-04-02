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
import { UserPlus, ShieldCheck, UserCircle, UploadCloud, GraduationCap, School } from "lucide-react";

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
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-xs font-black uppercase tracking-widest">Syncing Classroom Data...</p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-8 p-2" onSubmit={onSubmit}>
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
          <UserPlus size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            {type === "create" ? "Enroll Student" : "Update Student"}
          </h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Student Information System
          </p>
        </div>
      </div>

      {/* AUTH SECTION - Wider Single Column Layout */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Credentials</span>
        </div>
        <div className="grid grid-cols-1 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
          <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
          <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
          <InputField label="Password" name="password" type="password" register={register} error={errors?.password} />
        </div>
      </div>

      {/* PERSONAL SECTION - Two Column Layout for better visibility */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <UserCircle size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">

          {/* PHOTO UPLOAD - Full width on small, joins grid on medium */}
          <div className="md:col-span-2 flex flex-col gap-3 justify-center items-center p-6 bg-white rounded-2xl border border-dashed border-slate-200 mb-2">
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
              }}
            >
              {({ open }) => { // 1. Added opening curly brace
                const isReady = !!open;

                return ( // 2. Added explicit return
                  <div
                    className={`text-center group ${isReady ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`} onClick={() => open?.()}>
                    <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white shadow-md group-hover:border-blue-400 transition-all">
                      {img ? (
                        <Image src={img.secure_url || img} alt="Preview" fill className="object-cover" />
                      ) : (
                        <UploadCloud size={28} className="text-slate-300 group-hover:text-blue-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">
                      {isReady ? (img ? "Change Photo" : "Upload Photo") : "Loading..."}
                    </span>
                  </div>
                ); // 3. Closed return
              }}
            </CldUploadWidget>
          </div>

          <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
          <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
          <InputField label="Contact Number" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
          <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />
          <InputField
            label="Birthday"
            name="birthday"
            type="date"
            defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
            register={register}
            error={errors.birthday}
          />
          <InputField label="Parent ID Reference" name="parentId" defaultValue={data?.parentId} register={register} error={errors.parentId} />

          {/* Address made wider to accommodate long strings */}
          <div className="md:col-span-2">
            <InputField label="Residential Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sex</label>
            <select className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none" {...register("sex")} defaultValue={data?.sex}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* ENROLLMENT SECTION */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <School size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academic Placement</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grade Level</label>
            <div className="relative group">
              <select className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none" {...register("gradeId", { valueAsNumber: true })} defaultValue={data?.gradeId}>
                {grades.map((grade: any) => (
                  <option value={grade.id} key={grade.id}>Grade {grade.level}</option>
                ))}
              </select>
              <GraduationCap className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Class Assigned</label>
            <select className="p-4 rounded-2xl bg-white border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none" {...register("classId", { valueAsNumber: true })} defaultValue={data?.classId}>
              {classes.map((c: any) => (
                <option value={c.id} key={c.id}>
                  {c.name} ({c._count.students}/{c.capacity} Enrolled)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Validation Error: Please check required fields</span>
          </div>
        )}

        {state.error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">
              {state.message || "Validation Error: Please check required fields"}
            </span>
          </div>
        )}
        <button type="submit" className="bg-slate-900 hover:bg-blue-600 text-white py-4 px-10 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95 self-end">
          {type === "create" ? "Complete Enrollment" : "Update Record"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;