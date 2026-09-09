"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { incomeSchema, IncomeSchema } from "@/lib/validation/finance";

export async function createIncome(
  _: any,
  data: IncomeSchema
) {
  try {
    const { sessionClaims } = await auth();

    const schoolId = (sessionClaims?.metadata as any)?.schoolId;

    if (!schoolId) {
      return {
        success: false,
        error: true,
        message: "School not found.",
      };
    }

    const validated = incomeSchema.parse(data);

    await prisma.income.create({
      data: {
        title: validated.title,
        description: validated.description,
        amount: validated.amount,
        category: validated.category,
        paymentMethod: validated.paymentMethod,
        receivedAt: validated.receivedAt ?? new Date(),
        schoolId,
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
      message: "Income created successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to create income.",
    };
  }
}

export async function updateIncome(
  _: any,
  data: IncomeSchema
) {
  try {
    const validated = incomeSchema.parse(data);

    if (!validated.id) {
      return {
        success: false,
        error: true,
        message: "Income ID is required.",
      };
    }

    await prisma.income.update({
      where: {
        id: validated.id,
      },
      data: {
        title: validated.title,
        description: validated.description,
        amount: validated.amount,
        category: validated.category,
        paymentMethod: validated.paymentMethod,
        receivedAt: validated.receivedAt ?? new Date(),
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
      message: "Income updated successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to update income.",
    };
  }
}

export async function deleteIncome(
  _: any,
  formData: FormData
) {
  try {
    const id = Number(formData.get("id"));

    await prisma.income.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/finance");

    return {
      success: true,
      error: false,
      message: "Income deleted successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: true,
      message: "Failed to delete income.",
    };
  }
}