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
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-center">
        {type === "create" ? "Create a new parent" : "Update parent"}
      </h1>
      
      <span className="text-xs text-gray-400 font-medium medium text-center border-b pb-2">Authentication Information</span>
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
        
        {data && <InputField label="Id" name="id" defaultValue={data?.id} register={register} error={errors?.id} hidden />}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
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

      <SubmitButton type={type} />
    </form>
  );
};

export default ParentForm;