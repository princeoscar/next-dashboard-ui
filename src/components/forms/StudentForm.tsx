"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { createStudent, updateStudent } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { studentSchema, StudentSchema } from "@/lib/validation";

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

  const [isPending, setIsPending] = useState(false);
  const onSubmit = handleSubmit(async (values) => {
    console.log("FORM SUBMITTED");
    console.log(values);
    setIsPending(true);

    const initialState = {
      success: false,
      error: false,
      message: "",
    };

    const result =
      type === "create"
        ? await createStudent(initialState, values)
        : await updateStudent(initialState, {
            ...values,
            id: data.id,
          });

    setIsPending(false);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });

  const { levels = [], classes = [], parents = [] } = relatedData || {};

  const [selectedLevel, setSelectedLevel] = useState<number | "">(
    data?.levelId ?? ""
  );

  const filteredClasses = classes.filter(
    (c: any) => c.levelId === Number(selectedLevel)
  );

  return (
    <form
      onSubmit={(e) => {
        console.log("FORM EVENT");
        console.log("Validation errors:", errors);
        e.preventDefault();
        onSubmit(e);
      }}
      className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 max-h-[85vh] overflow-y-auto"
    >
      {type === "update" && (
        <input
          type="hidden"
          {...register("id")}
          defaultValue={data?.id}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
        <h1 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">
          {type === "create" ? "Enroll" : "Update"} <span className="text-rubixPurple">Student</span>
        </h1>
        <p className="text-[11px] text-slate-400 font-medium">Please ensure all required fields are accurate.</p>
      </div>

      {/* TOP SECTION: Photo and Account Details */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        <div className="w-full md:w-1/4">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Portrait</label>
          <CldUploadWidget uploadPreset="school" onSuccess={(res: any) => setImg(res.info)}>
            {({ open }) => (
              <div
                onClick={() => open()}
                className="h-28 md:h-32 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group relative overflow-hidden bg-slate-50/50"
              >
                <Image 
                  src={img?.secure_url || data?.img || "/upload.png"} 
                  alt="avatar" 
                  width={36} 
                  height={36} 
                  className="opacity-50 group-hover:scale-110 transition-transform object-cover rounded-xl" 
                />
                <span className="text-[9px] font-black text-slate-500 mt-2 tracking-wide">UPLOAD PHOTO</span>
              </div>
            )}
          </CldUploadWidget>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <InputField
            label="Username"
            name="username"
            defaultValue={data?.username}
            register={register}
            error={errors?.username}
          />

          <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors?.email} />

          {!data && (
            <InputField 
              label="Password" 
              name="password" 
              type="password" 
              register={register} 
              error={errors?.password} 
              inputProps={{ autoComplete: "new-password" }} 
            />
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Parent / Guardian</label>
            <select
              {...register("parentId")}
              defaultValue={data?.parentId ?? ""}
              className="p-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-white ring-1 ring-slate-100 focus:ring-2 focus:ring-rubixPurple outline-none"
            >
              <option value="">No Parent Assigned</option>
              {parents.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
            {errors.parentId?.message && <p className="text-[10px] text-red-400">{errors.parentId.message.toString()}</p>}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Personal & Academic Details Grid */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 pb-2 tracking-widest">
          Personal & Academic Details
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
          <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
          <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
          <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
          <InputField 
            label="Birthday" 
            name="birthday" 
            type="date" 
            register={register} 
            error={errors.birthday} 
            defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""} 
          />
          <InputField label="Blood Type" name="bloodType" defaultValue={data?.bloodType} register={register} error={errors.bloodType} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Sex</label>
            <select 
              {...register("sex")} 
              className="p-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-white ring-1 ring-slate-100 outline-none" 
              defaultValue={data?.sex}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Level</label>
            <select
              {...register("levelId", { valueAsNumber: true })}
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : "")}
              className="p-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-white ring-1 ring-slate-100 outline-none"
            >
              <option value="">Select Level</option>
              {levels.map((g: any) => (
                <option key={g.id} value={g.id}>
                  {g.level}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500">Class</label>
            <select
              {...register("classId", { valueAsNumber: true })}
              className="p-2.5 border border-slate-200 rounded-xl text-xs md:text-sm bg-white ring-1 ring-slate-100 outline-none"
              defaultValue={data?.classId}
            >
              <option value="">
                {selectedLevel ? "Select Class" : "Select Level First"}
              </option>
              {filteredClasses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FIXED ACTION BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-full sm:w-auto px-6 py-2.5 text-xs md:text-sm font-bold text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Discard Changes
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-2.5 bg-slate-900 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-rubixPurple disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
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