"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAllocation(
  id: number,
  formData: FormData
) {
  const amount = Number(formData.get("amount"));

  const dueDate =
    formData.get("dueDate")?.toString() || null;

  await prisma.feeAllocation.update({
    where: {
      id,
    },
    data: {
      amount,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/admin/finance/allocate");
  revalidatePath(`/admin/finance/allocate/${id}`);
}