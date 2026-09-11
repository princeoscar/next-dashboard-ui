"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { createTeacher, updateTeacher } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { teacherSchema, TeacherSchema } from "@/lib/validation";

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
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      sex: data?.sex || "MALE",
      staffId: data?.staffId || "",
      birthday: data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "",
      employmentDate: data?.employmentDate ? new Date(data.employmentDate).toISOString().split("T")[0] : "",
      subjects: data?.subjects?.map((s: { id: number }) => String(s.id)) || [],
    }
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      img: img?.secure_url || data?.img || "",
    };

    const initialState = {
      success: false,
      error: false,
      message: "",
    };

    const result =
      type === "create"
        ? await createTeacher(initialState, payload)
        : await updateTeacher(initialState, {
            ...payload,
            id: data.id,
          });

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }, (errors) => {
    console.log("VALIDATION ERRORS:", errors);
  });

  const { subjects = [] } = relatedData || {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">

      {/* AUTHENTICATION SECTION */}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
          Authentication Info
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            register={register}
            error={errors.username}
          />
          <InputField
            label="Email"
            name="email"
            defaultValue={data?.email}
            register={register}
            error={errors.email}
          />
          {!data && (
            <div className="md:col-span-2">
              <InputField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
              />
            </div>
          )}
        </div>
      </div>

      {/* PERSONAL PROFILE SECTION */}
      <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded w-max border border-slate-100">
          Personal Profile
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            defaultValue={data?.firstName}
            register={register}
            error={errors.firstName}
          />
          <InputField
            label="Last Name"
            name="lastName"
            defaultValue={data?.lastName}
            register={register}
            error={errors.lastName}
          />
          <InputField
            label="Phone"
            name="phone"
            defaultValue={data?.phone}
            register={register}
            error={errors.phone}
          />
          <InputField
            label="Address"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors.address}
          />
          <InputField
            label="Blood Type"
            name="bloodType"
            defaultValue={data?.bloodType}
            register={register}
            error={errors.bloodType}
          />
          <InputField
            label="Birthday"
            name="birthday"
            type="date"
            defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
            register={register}
            error={errors.birthday}
          />
          <InputField
            label="Staff ID"
            name="staffId"
            defaultValue={data?.staffId}
            register={register}
            error={errors.staffId}
          />
          <InputField
            label="Employment Date"
            name="employmentDate"
            type="date"
            defaultValue={data?.employmentDate ? new Date(data.employmentDate).toISOString().split("T")[0] : ""}
            register={register}
            error={errors.employmentDate}
          />
        </div>
      </div>

      {/* ADDITIONAL OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 font-medium">Sex</label>
          <select
            className="ring-[1.5px] ring-slate-200 p-2.5 rounded-xl text-sm w-full bg-white text-slate-700 outline-none focus:ring-blue-400 transition"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-500 font-medium">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-slate-200 p-2 rounded-xl text-sm w-full bg-white text-slate-700 outline-none focus:ring-blue-400 transition h-20"
            {...register("subjects")}
          >
            {subjects.map((subject) => (
              <option value={String(subject.id)} key={subject.id}>{subject.name}</option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">{errors.subjects.message.toString()}</p>
          )}
        </div>
      </div>

      {/* PHOTO UPLOAD */}
      <div className="pt-2">
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-slate-600 flex items-center justify-center gap-2 cursor-pointer border border-dashed border-slate-300 p-3.5 rounded-xl hover:bg-slate-50 transition w-full"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={20} height={20} />
                <span className="font-medium">{img ? "Photo uploaded successfully!" : "Upload a photo"}</span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>

      {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}

      {/* FORM FOOTER BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 transition text-sm text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-6 py-2.5 rounded-xl transition shadow-sm text-sm text-center"
        >
          {type === "create" ? "Create Teacher" : "Update Teacher"}
        </button>
      </div>

    </form>
  );
};

export default TeacherForm;