"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useState } from "react";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";

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
  const { register, handleSubmit, formState: { errors } } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema) as any,
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  // Notice: 'isPending' tells us if the server is still working
  const [state, formAction, isPending] = useActionState<any, any>(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false, message: "" }
  );

  // DELETE ANY OTHER 'const onSubmit' and use ONLY this one:
  const onSubmit = handleSubmit(
    (formData) => {
      startTransition(() => {
        formAction({
          ...formData,
          // 🎯 Ensure the ID is passed for updates
          id: data?.id,
          img: img?.secure_url || data?.img,
          schoolId: "1"
        });
      });
    },
    (err) => {
      console.log(err);
      alert("Missing fields: " + Object.keys(err).join(", "));
    }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Student ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong.");
    }
  }, [state, type, setOpen, router]);

  const { levels = [], classes = [], parents = [] } = relatedData || {};

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-6 bg-white">
        {/* 🎯 FIXING ARROW: ADD THIS BLOCK HERE ⬇️ */}
        {type === "update" && (
          <input
            type="hidden"
            {...register("id")}
            defaultValue={data?.id}
          />
        )}
        {/* 🎯 THIS ENSURES ZOD SEES THE ID DURING UPDATES */}

        <div className="flex flex-col gap-1 border-b pb-4">
          <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
            {type === "create" ? "Enroll" : "Update"} <span className="text-blue-600">Student</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">Please ensure all required fields are accurate.</p>
        </div>

        {/* TOP SECTION: Photo and Account */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/4">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Portrait</label>
            <CldUploadWidget uploadPreset="school" onSuccess={(res: any) => setImg(res.info)}>
              {({ open }) => (
                <div
                  onClick={() => open()}
                  className="h-32 w-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group relative overflow-hidden"
                >
                  <Image src={img?.secure_url || data?.img || "/upload.png"} alt="avatar" width={40} height={40} className="opacity-50 group-hover:scale-110 transition-transform" style={{ height: '40px', width: '40px' }} />
                  <span className="text-[10px] font-bold text-blue-600 mt-2">UPLOAD PHOTO</span>
                </div>
              )}
            </CldUploadWidget>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
            <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
            {!data && <InputField label="Password" name="password" type="password" register={register} error={errors?.password} inputProps={{ autoComplete: "new-password" }} />}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">Parent / Guardian</label>
              <select {...register("parentId")} className="p-2 border rounded-md text-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={data?.parentId}>
                <option value="">Select Parent</option>
                {parents.map((p: any) => <option key={p.id} value={p.id}>{p.name} {p.surname}</option>)}
              </select>
              {errors.parentId?.message && <p className="text-xs text-red-400">{errors.parentId.message.toString()}</p>}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 3-Column Grid */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-gray-400 border-b pb-2 tracking-widest">Personal & Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
            <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
            <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
            <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
            <InputField label="Birthday" name="birthday" type="date" register={register} error={errors.birthday} defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""} />
            <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />

            {/* 🎯 CLEANUP: Move the hidden schoolId here or keep it in onSubmit */}
            <input type="hidden" value="your-real-school-id-here" {...register("schoolId")} />


            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">Sex</label>
              <select {...register("sex")} className="p-2 border rounded-md text-sm ring-1 ring-gray-200" defaultValue={data?.sex}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">Level</label>
              <select {...register("levelId", { valueAsNumber: true })} className="p-2 border rounded-md text-sm ring-1 ring-gray-200" defaultValue={data?.levelId}>
                {levels.map((g: any) => <option key={g.id} value={g.id}>Level {g.level}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500">Class</label>
              <select {...register("classId", { valueAsNumber: true })} className="p-2 border rounded-md text-sm ring-1 ring-gray-200" defaultValue={data?.classId}>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* FIXED ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-4 border-t pt-6 mt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Discard Changes
          </button>

          <button
            disabled={isPending}
            className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{type === "create" ? "Confirm Enrollment" : "Update Profile"}</span>
            )}
          </button>
        </div>
      </form>
      );
};

      export default StudentForm;