"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const { userId } = await auth();
  
    const admin = await prisma.admin.findUnique({
      where: {
        clerkId: userId!,
      },
      select: {
        schoolId: true,
      },
    });
  
    if (!admin) {
      return {
        success: false,
        error: true,
        message: "Admin not found.",
      };
    }
  
    const schoolId = admin.schoolId;
  
    if (!schoolId) {
      return {
        success: false,
        error: true,
        message: "School not found.",
      };
    }
  
  
    const school = await prisma.school.findUnique({
    where: {
      id: schoolId,
    },
    select: {
      code: true,
    },
  });
  
  if (!school) {
    return {
      success: false,
      error: true,
      message: "School not found.",
    };
  }
  
   

  const name = formData.get("name")?.toString().trim() || "";
  const description = formData.get("description")?.toString() || "";
  const isActive = formData.get("isActive") === "on";

  if (!name) {
    throw new Error("Category name is required.");
  }

  await prisma.feeCategory.create({
    data: {
      name,
      description,
      isActive,
      schoolId,
    },
  });

  revalidatePath("/admin/finance/categories");
}

export async function updateCategory(
  id: number,
  formData: FormData
) {
  const name = formData.get("name")?.toString().trim() || "";
  const description = formData.get("description")?.toString() || "";
  const isActive = formData.get("isActive") === "on";

  await prisma.feeCategory.update({
    where: {
      id,
    },
    data: {
      name,
      description,
      isActive,
    },
  });

  revalidatePath("/admin/finance/categories");
  revalidatePath(`/admin/finance/categories/${id}`);
}

export async function deleteCategory(id: number) {
  const allocations = await prisma.feeAllocation.count({
    where: {
      feeCategoryId: id,
    },
  });

  if (allocations > 0) {
    throw new Error(
      "Cannot delete a category that has allocations."
    );
  }

  await prisma.feeCategory.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/finance/categories");
}

