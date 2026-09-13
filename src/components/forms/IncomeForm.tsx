"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";

import {
  createIncome,
  updateIncome,
} from "@/lib/server-actions";

import {
  incomeSchema,
  IncomeSchema,
} from "@/lib/validation";

const paymentMethods = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "PAYSTACK",
  "POS",
];

const IncomeForm = ({
  type,
  data,
  setOpen,
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
  } = useForm<IncomeSchema>({
    resolver: zodResolver(incomeSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create"
      ? createIncome
      : updateIncome,
    {
      success: false,
      error: false,
      message: "",
    }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction(formData);
    });
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Income ${
          type === "create"
            ? "created"
            : "updated"
        } successfully.`
      );

      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(
        state.message ?? "Something went wrong."
      );
    }
  }, [state, router, setOpen, type]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 sm:gap-6 max-h-[80vh] overflow-y-auto px-3 sm:px-4 pb-6 pt-1 focus:outline-none"
    >
      <h1 className="text-lg sm:text-xl font-bold">
        {type === "create"
          ? "Add Income"
          : "Update Income"}
      </h1>

      {data && (
        <input
          type="hidden"
          {...register("id")}
          defaultValue={data.id}
        />
      )}

      <InputField
        label="Title"
        name="title"
        register={register}
        defaultValue={data?.title}
        error={errors.title}
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        defaultValue={data?.description}
        error={errors.description}
      />

      <InputField
        label="Amount"
        type="number"
        name="amount"
        register={register}
        defaultValue={data?.amount?.toString()}
        error={errors.amount}
        inputProps={{
          step: "0.01",
        }}
      />

      <InputField
        label="Category"
        name="category"
        register={register}
        defaultValue={data?.category}
        error={errors.category}
      />

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-xs font-bold">
          Payment Method
        </label>

        <select
          {...register("paymentMethod")}
          defaultValue={
            data?.paymentMethod ?? ""
          }
          className="ring-[1.5px] ring-gray-300 rounded-md p-2.5 sm:p-3 text-sm bg-white"
        >
          <option value="">
            Select Payment Method
          </option>

          {paymentMethods.map((method) => (
            <option
              key={method}
              value={method}
            >
              {method.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        {errors.paymentMethod && (
          <p className="text-xs text-red-500">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      <InputField
        label="Received Date"
        type="date"
        name="receivedAt"
        register={register}
        defaultValue={
          data?.receivedAt
            ? new Date(data.receivedAt)
                .toISOString()
                .split("T")[0]
            : undefined
        }
        error={errors.receivedAt}
      />

      <button
        type="submit"
        className="bg-rubixPurple text-white py-3 rounded-lg font-semibold mt-2 transition-opacity hover:opacity-90 active:scale-[0.99]"
      >
        {type === "create"
          ? "Create Income"
          : "Update Income"}
      </button>
    </form>
  );
};

export default IncomeForm;