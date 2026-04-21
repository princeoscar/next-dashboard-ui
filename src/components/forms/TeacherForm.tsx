"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useActionState, startTransition } from "react";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";

interface TeacherFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    subjects: { id: number; name: string }[];
  };
}

const TeacherForm = ({ type, data, setOpen, relatedData }: TeacherFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema) as any
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createTeacher : updateTeacher,
    { success: false, error: false, message: "" }
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({ ...formData, img: img?.secure_url });
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      const timer = setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 200);
      return () => clearTimeout(timer);
    }
    if (state.error) {
      toast.error(state.message || "An error occurred!");
    }
  }, [state.success, state.error, state.message, router, type, setOpen]);

  const { subjects = [] } = relatedData || {};

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      {/* 1. STICKY HEADER */}
      <div className="sticky top-0 bg-white z-50 px-6 py-4 border-b">
  <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
    {type === "create" ? "Create New" : "Update"}{" "}
    <span className="text-rubixPurple">Teacher</span>
  </h1>
</div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className="px-6 py-6 space-y-8 pb-28">
        
        {/* Authentication Section */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Authentication Info
          </span>
          <div className="flex justify-between flex-wrap gap-4 mt-6">
            <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
            <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
            {!data && <InputField label="Password" name="password" type="password" register={register} error={errors?.password} />}
          </div>
        </div>

        {/* Personal Profile Section */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Personal Profile
          </span>
          <div className="flex justify-between flex-wrap gap-4 mt-6">
            <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
            <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
            <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
            <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
            <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />
            <InputField
              label="Birthday"
              name="birthday"
              type="date"
              defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
              register={register}
              error={errors.birthday}
            />
          </div>
        </div>

        {/* Administrative Details Section */}
        <div className="space-y-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Administration
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* Sex Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-bold">Sex</label>
              <select className="ring-[1.5px] ring-gray-300 p-3 rounded-xl text-sm w-full" {...register("sex")} defaultValue={data?.sex}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex?.message && <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>}
            </div>

            {/* Subjects Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-bold">Subjects</label>
              <select
                multiple
                className="ring-[1.5px] ring-gray-300 p-3 rounded-xl text-sm w-full min-h-[100px]"
                {...register("subjects")}
                defaultValue={data?.subjects?.map((s: { id: number }) => s.id)}
              >
                {subjects.map((subject) => (
                  <option value={subject.id} key={subject.id}>{subject.name}</option>
                ))}
              </select>
              {errors.subjects?.message && <p className="text-xs text-red-400">{errors.subjects.message.toString()}</p>}
            </div>

            {/* Cloudinary Upload */}
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
              }}
            >
              {({ open }) => (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-bold">Profile Photo</label>
                  <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => open()}>
                    <Image src="/upload.png" alt="upload" width={20} height={20} />
                    <span className="text-xs font-bold text-slate-500">{img ? "Uploaded! ✅" : "Upload Image"}</span>
                  </div>
                </div>
              )}
            </CldUploadWidget>
          </div>
        </div>

        {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}
      </div>

      {/* 3. STICKY FOOTER */}
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        {state.error && <p className="text-red-500 text-xs mb-2 font-bold text-center">Update failed. Please check inputs.</p>}
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg active:scale-[0.98]">
          {type === "create" ? "Confirm & Create Teacher" : "Save Teacher Changes"}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;