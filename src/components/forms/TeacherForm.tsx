"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useActionState, startTransition } from "react"; // ✅ useActionState
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema) as any
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  // ✅ 1. Next.js 15: useActionState
  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createTeacher : updateTeacher,
    { success: false, error: false, message: "" }
  );

  // ✅ 2. Payload Preparation
  const onSubmit = handleSubmit((formData) => {
  // Wrap the call in startTransition to satisfy the useActionState requirement
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

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      
      <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors?.username} />
        <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />
        <InputField label="Password" name="password" type="password" defaultValue={data?.password} register={register} error={errors?.password} />
      </div>

      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
        <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
        <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
        <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
        <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />
        
        {/* ✅ 3. Safe Date Handling */}
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
          register={register}
          error={errors.birthday}
          type="date"
        />

        {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("sex")} defaultValue={data?.sex}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
            {...register("subjects")}
            defaultValue={data?.subjects?.map((s: { id: number }) => s.id)}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && <p className="text-xs text-red-400">{errors.subjects.message.toString()}</p>}
        </div>

        {/* ✅ 4. Cloudinary Integration */}
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer pt-4" onClick={() => open()}>
              <Image src="/upload.png" alt="upload" width={28} height={28} />
              <span>{img ? "Photo Uploaded! ✅" : "Upload a photo"}</span>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {state.error && <span className="text-red-500 text-sm">Something went wrong! Please check your inputs.</span>}
      
      <button className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors">
        {type === "create" ? "Create Teacher" : "Update Teacher"}
      </button>
    </form>
  );
};

export default TeacherForm;