"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { streamSchema, StreamSchema } from "@/lib/validation";
import { createStream, updateStream } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction } from "react";
import InputField from "../InputField";

const StreamForm = ({
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
  } = useForm<StreamSchema>({
    resolver: zodResolver(streamSchema) as any,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (values) => {
     console.log(values);

    const initialState = {
      success: false,
      error: false,
      message: "",
    };

    const result =
      type === "create"
        ? await createStream(initialState, values)
        : await updateStream(initialState, {
            ...values,
            id: data.id,
          });


          console.log(result);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }

    
  });

  

  return (
    <form className="flex flex-col gap-6 p-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold">
        {type === "create" ? "Create Stream" : "Update Stream"}
      </h1>

      {data && (
        <input
          type="hidden"
          {...register("id")}
          defaultValue={data.id}
        />
      )}

      <InputField
        label="Stream Name"
        name="name"
        register={register}
        defaultValue={data?.name}
        error={errors.name}
      />

      <InputField
  label="Stream Code"
  name="code"
  register={register}
  defaultValue={data?.code}
  error={errors.code}
/>

      <button
        type="submit"
        className="bg-slate-900 text-white py-3 rounded-xl"
      >
        {type === "create" ? "Create Stream" : "Update Stream"}
      </button>
    </form>
  );
};

export default StreamForm;