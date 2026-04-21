"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchema";
import { useFormStatus } from "react-dom";

const SubmitButton = ({ type }: { type: "create" | "update" }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 transition-colors"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        type === "create" ? "Create Parent" : "Update Parent"
      )}
    </button>
  );
};

const ParentForm = ({
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
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema) as any,
  });

  const [state, formAction] = useActionState<any, any>(
    type === "create" ? createParent : updateParent,
    { success: false, error: false, message: "" }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      const timer = setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 200);
      return () => clearTimeout(timer);
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({ ...formData, id: data?.id });
    });
  });

  // ✅ FIX: Ensure students is at least an empty array to prevent .map() errors
  const students = relatedData?.students || [];

  return (
    <form className="flex flex-col w-full max-w-2xl mx-auto" onSubmit={onSubmit}>
      <div className="sticky top-0 text-center bg-white z-50 px-6 py-4 border-b">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
          {type === "create" ? "Create New" : "Update"}{" "}
          <span className="text-rubixPurple">Parent</span>
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

      <div className="flex justify-between flex-wrap gap-4 t-6">
        <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
        <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
        <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
        <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
        
        {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}
</div>
        <div className="flex flex-col gap-2 w-full md:w-1/4 mb-5">
          <label className="text-xs text-gray-500">Students (Children)</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("students")}
            defaultValue={data?.students?.map((s: any) => s.id) || []}
          >
            {/* ✅ Optional chaining added here as well for double safety */}
            {students?.map((student: { id: string; name: string; surname: string }) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.students?.message && <p className="text-xs text-red-400">{errors.students.message.toString()}</p>}
        </div>
      </div>
      </div>
     

     <div className="sticky bottom-0 bg-white px-6 py-4 border-t z-50 mt-4">
        {state.error && <p className="text-red-500 text-xs mb-2 font-bold text-center">Update failed. Please check inputs.</p>}
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-rubixPurple transition-all shadow-lg active:scale-[0.98]">
          {type === "create" ? "Confirm & Create Parent" : "Save Parent Changes"}
        </button>
      </div>

    </form>
  );
};

export default ParentForm;