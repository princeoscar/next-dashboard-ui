"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server";



async function getCurrentAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      schoolId: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  return admin;
}



export const createAcademicYear = async (name: string) => {
  try {
    const admin = await getCurrentAdmin();

const schoolId = admin.schoolId;
    
    console.log("School ID:", schoolId);

    if (!schoolId) {
      return {
        success: false,
        error: "No schoolId found in Clerk metadata.",
      };
    }

    await prisma.academicYear.create({
      data: {
        name,
        isCurrent: false,
        school: {
          connect: {
            id: schoolId,
          },
        },
      },
    });

    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to create academic year.",
    };
  }
};

export const updateActiveSession = async (yearId: number) => {
  try {
    const admin = await getCurrentAdmin();

const session = await prisma.academicYear.findFirst({
  where: {
    id: yearId,
    schoolId: admin.schoolId,
  },
});

if (!session) {
  return {
    success: false,
    error: "Academic session not found.",
  };
}

if (!session) {
  return {
    success: false,
    error: "Academic session not found.",
  };
}

if (session.isClosed) {
  return {
    success: false,
    error: "Closed academic sessions cannot be activated.",
  };
}



const schoolId = admin.schoolId;

    if (!schoolId) {
      return {
        success: false,
        error: "School not found.",
      };
    }
    await prisma.$transaction([
      
  prisma.academicYear.updateMany({
    where: {
      schoolId,
    },
    data: {
      isCurrent: false,
    },
  }),

  prisma.academicYear.update({
    where: {
      id: yearId,
    },
    data: {
      isCurrent: true,
    },
  }),
]);
    
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update session" };
  }
};





export const closeAcademicSession = async () => {
  try {
    const admin = await getCurrentAdmin();

const currentYear = await prisma.academicYear.findFirst({
  where: {
    schoolId: admin.schoolId,
    isCurrent: true,
  },
});

    if (!currentYear) {
      return {
        success: false,
        error: "No active academic session.",
      };
    }

    const pendingPromotions = await prisma.promotion.count({
  where: {
    academicYearId: currentYear.id,
    status: "PENDING",
  },
});

if (pendingPromotions > 0) {
  return {
    success: false,
    error: `${pendingPromotions} promotion(s) are still pending.`,
  };
}

const unpublishedResults = await prisma.result.count({
  where: {
    academicYearId: currentYear.id,
    published: false,
  },
});

if (unpublishedResults > 0) {
  return {
    success: false,
    error: `${unpublishedResults} result(s) have not been published.`,
  };
}

    await prisma.academicYear.update({
      where: {
        id: currentYear.id,
      },
      data: {
        isClosed: true,
      },
    });

    revalidatePath("/admin/settings");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Unable to close academic session.",
    };
  }
};