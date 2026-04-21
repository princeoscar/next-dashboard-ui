"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";
import { Divide } from "lucide-react";

// 1. SUBMIT BUTTON COMPONENT
const SubmitButton = ({ type }: { type: "create" | "update" }) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        type === "create" ? "Create Student" : "Update Student"
      )}
    </button>
  );
};

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
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  // 2. ACTION STATE HOOK
  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false, message: "" }
  );

  // 3. SUBMIT HANDLER WITH TRANSITION
  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction({ ...data, img: img?.secure_url });
    });
  });

  // 4. SUCCESS/ERROR NOTIFICATIONS & MODAL CLOSING
  useEffect(() => {
    if (state.success) {
      toast.success(`Student has been ${type === "create" ? "created" : "updated"}!`);

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

  const { grades = [], classes = [], parents = [] } = relatedData || {};
  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Student</span>
        </h1>
      </div>

      <div className="px-6 py-6 space-y-8 pb-28">
        {/* Authentication Section */}
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Authentication Info
          </span>

          <div className="flex justify-between flex-wrap gap-4 mt-6">
            <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
            <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
            <InputField label="Password" name="password" type="password" defaultValue={data?.password} register={register} error={errors?.password} />
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4 mt-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">
            Personal Information
          </span>


          <div className="flex justify-between flex-wrap gap-4 mt-6">
            {/* PHOTO UPLOAD */}
            <div className="flex items-center gap-4 w-full md:w-1/4 mt-4">
              <CldUploadWidget
                uploadPreset="school"
                onSuccess={(result, { widget }) => {
                  setImg(result.info);
                  widget.close();
                }}
              >
                {({ open }) => (
                  <div className="flex items-center gap-2 cursor-pointer text-xs text-gray-500" onClick={() => open()}>
                    <Image src="/upload.png" alt="" width={28} height={28} />
                    <span>Upload a photo</span>
                  </div>
                )}
              </CldUploadWidget>
              {img && <Image src={img.secure_url} alt="" width={40} height={40} className="rounded-full w-10 h-10 object-cover border" />}
            </div>
          </div>

          {/* PARENT SELECT */}
          <div className="flex flex-col gap-2 w-full md:w-1/4 mt-6">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-500">Parent</label>
              <Link href="/list/parents" target="_blank" className="text-[10px] text-blue-500 underline">+ New Parent</Link>
            </div>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("parentId")}
              defaultValue={data?.parentId}
            >
              <option value="">Select a Parent</option>
              {parents.map((parent: { id: string; name: string; surname: string }) => (
                <option value={parent.id} key={parent.id}>{parent.name} {parent.surname}</option>
              ))}
            </select>
            {errors.parentId?.message && <p className="text-xs text-red-400">{errors.parentId.message.toString()}</p>}
          </div>
        </div>

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

          {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}

          <div className="flex flex-col gap-2 w-full md:w-1/4 mb-4">
            <label className="text-xs text-gray-500">Sex</label>
            <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("sex")} defaultValue={data?.sex}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            {errors.sex?.message && <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Grade</label>
            <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("gradeId", { valueAsNumber: true })} defaultValue={data?.gradeId}>
              {grades.map((grade: { id: number; level: number }) => (
                <option value={grade.id} key={grade.id}>{grade.level}</option>
              ))}
            </select>
            {errors.gradeId?.message && <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Class</label>
            <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("classId", { valueAsNumber: true })} defaultValue={data?.classId}>
              {classes.map((classItem: any) => (
                <option value={classItem.id} key={classItem.id}>
                  {/* Use optional chaining (?.) and a fallback (0) to prevent the error */}
                  {classItem.name} ({classItem._count?.students || 0}/{classItem.capacity || "∞"})
                </option>
              ))}
            </select>
            {errors.classId?.message && <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50">
        {state.error && <p className="text-red-500 text-xs mb-2 font-bold text-center">Update failed. Please check inputs.</p>}
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg active:scale-[0.98]">
          {type === "create" ? "Confirm & Create Student" : "Save Student Changes"}
        </button>
      </div>



    </form>
  );
};

export default StudentForm;