"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getActiveConfig } from "@/lib/settings";

export async function publishResults() {
  const { userId, sessionClaims } = await auth();


  const metadata = sessionClaims?.metadata as {
  schoolId?: string;
};



const schoolId = metadata.schoolId;

if (!schoolId) {
  throw new Error("School not found.");
}

  const currentYear = await getActiveConfig(schoolId);

  if (!currentYear) {
    throw new Error("No active academic session.");
  }

  const result = await prisma.result.updateMany({
    where: {
      schoolId,
      academicYearId: currentYear.id,
      published: false,
    },
    data: {
     published: true,
  publishedAt: new Date(),
  publishedBy: userId,
    },
  });

 

  revalidatePath("/list/results");
  revalidatePath("/print");
revalidatePath("/parent");
revalidatePath("/student");

  return {
    success: true,
    message: `${result.count} result(s) published successfully.`,
    published: result.count,
  };
}