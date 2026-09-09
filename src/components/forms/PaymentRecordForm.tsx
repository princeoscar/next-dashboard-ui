"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useActionState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";

import {
  paymentRecordSchema,
  PaymentRecordSchema,
} from "@/lib/validation/finance";

import {
  createPaymentRecord,
  updatePaymentRecord,
} from "@/lib/server-actions";

import { PaymentMethod } from "@prisma/client";

interface Props {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    balances: any[];
  };
}

export default function PaymentRecordForm({
  type,
  data,
  setOpen,
  relatedData,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentRecordSchema>({
    resolver: zodResolver(paymentRecordSchema) as any,
    defaultValues: {
      paymentDate: data?.paymentDate
        ? new Date(data.paymentDate)
        : new Date(),
    },
  });

  const [state, formAction] = useActionState(
    type === "create"
      ? createPaymentRecord
      : updatePaymentRecord,
    {
      success: false,
      error: false,
      message: "",
    }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);

      setOpen(false);

      router.refresh();
    }

    if (state.error) {
      toast.error(state.message);
    }
  }, [state, router, setOpen]);

  const balances = relatedData?.balances || [];

  const selectedBalanceId = Number(
    watch("studentBalanceId")
  );

  const selectedBalance = balances.find(
    (b) => b.id === selectedBalanceId
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({
        ...formData,
        feeAllocationId:
          selectedBalance.feeAllocationId,
      });
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <h1 className="text-xl font-bold">
        {type === "create"
          ? "Record Payment"
          : "Update Payment"}
      </h1>

      {data && (
        <input
          type="hidden"
          {...register("id")}
          defaultValue={data.id}
        />
      )}

      <div>
        <label>Student Balance</label>

        <select
          {...register("studentBalanceId", {
            valueAsNumber: true,
          })}
          defaultValue={
            data?.studentBalanceId ?? ""
          }
          className="w-full border rounded-lg p-3"
        >
          <option value="">
            Select Student
          </option>

          {balances.map((balance) => (
            <option
              key={balance.id}
              value={balance.id}
            >
              {balance.student.name}{" "}
              {balance.student.surname}
              {" - "}
              {balance.allocation.category.name}
              {" - "}
              ₦
              {Number(
                balance.outstanding
              ).toLocaleString()}
            </option>
          ))}
        </select>

        <p className="text-red-500 text-xs">
          {
            errors.studentBalanceId
              ?.message
          }
        </p>
      </div>

      <InputField
        label="Amount Paid"
        name="amountPaid"
        type="number"
        register={register}
        defaultValue={data?.amountPaid}
        error={errors.amountPaid}
      />

      <div>
        <label>Payment Method</label>

        <select
          {...register("paymentMethod")}
          defaultValue={
            data?.paymentMethod
          }
          className="w-full border rounded-lg p-3"
        >
          {Object.values(
            PaymentMethod
          ).map((method) => (
            <option
              key={method}
              value={method}
            >
              {method}
            </option>
          ))}
        </select>
      </div>

      <InputField
        label="Transaction ID"
        name="transactionId"
        register={register}
        defaultValue={
          data?.transactionId
        }
        error={errors.transactionId}
      />

      <InputField
        label="Payment Channel"
        name="channel"
        register={register}
        defaultValue={data?.channel}
        error={errors.channel}
      />

      <InputField
        label="Received By"
        name="receivedBy"
        register={register}
        defaultValue={data?.receivedBy}
        error={errors.receivedBy}
      />

      <InputField
        label="Payment Date"
        name="paymentDate"
        type="date"
        register={register}
        defaultValue={
          data?.paymentDate
            ?.toString()
            ?.substring(0, 10)
        }
        error={errors.paymentDate}
      />

      <button
        className="w-full bg-rubixPurple text-white rounded-xl py-3 font-bold"
      >
        {type === "create"
          ? "Record Payment"
          : "Update Payment"}
      </button>
    </form>
  );
}