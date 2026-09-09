"use server";

import { AdmissionStatus, UserSex } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { generateApplicationNumber } from "../admission";
import { enrollStudent } from "@/lib/student/enrollment";

// 1. Updated Type to support Phase 1 file uploads
export type AdmissionInput = {
  schoolId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: UserSex;
  dateOfBirth: string;
  email?: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentOccupation?: string;
  applyingLevelId: number;
  applyingClassId?: number;
  // 🎯 Added upload strings
  passportPhoto?: string;
  birthCertificate?: string;
  reportCard?: string;
};

// --- PHASE 1: PUBLIC APPLICANT SUBMISSION ---

export async function submitAdmissionApplication(data: AdmissionInput) {
  try {
    const applicationNumber = await generateApplicationNumber(data.schoolId);

    const newApplication = await prisma.admission.create({
      data: {
        applicationNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        state: data.state,
        lga: data.lga,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
        parentOccupation: data.parentOccupation || null,
        applyingLevelId: Number(data.applyingLevelId),
        applyingClassId: data.applyingClassId
          ? Number(data.applyingClassId)
          : null,
        schoolId: data.schoolId,

        // 🎯 Check if these exist in your schema:
        // academicYearId: data.academicYearId, // Add if required
        // status: AdmissionStatus.PENDING,

        passportPhoto: data.passportPhoto || null,
        birthCertificate: data.birthCertificate || null,
        reportCard: data.reportCard || null,
      },
    });

    revalidatePath("/admin/admissions");

    return {
      success: true,
      applicationNumber: newApplication.applicationNumber,
      id: newApplication.id,
    };
  } catch (error) {
    console.error("Admission Action Error:", error);
    return {
      success: false,
      error:
        "Something went wrong. Please ensure all required fields are filled.",
    };
  }
}

// --- PHASE 2: ADMIN STATUS PIPELINE (Approve/Reject actions) ---
export async function updateAdmissionStatus(
  id: string,
  status: AdmissionStatus,
  remarks?: string,
) {
  try {
    const updated = await prisma.admission.update({
      where: { id },
      data: {
        status,
        remarks: remarks || null,
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/admin/admissions");
    revalidatePath(`/admin/admissions/${id}`);
    return { success: true, updated };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update application status." };
  }
}

// --- PHASE 3: CONVERT APPLICANT TO OFFICIAL ACTIVE STUDENT RECORD ---
export async function promoteApplicantToStudent({
  admissionId,
  classId,
  schoolId,
}: {
  admissionId: string;
  classId: number;
  schoolId: string;
}) {
  try {
    
      // 1. Fetch current application data
      const application = await prisma.admission.findUnique({
  where: {
    id: admissionId,
  },
});

if (!application) {
  throw new Error("Admission record not found.");
}

if (
  application.status === AdmissionStatus.ACCEPTED ||
  application.studentId !== null
) {
  throw new Error("This applicant has already been enrolled.");
}

      // 2. Fetch the target class section using structural fields
      const targetClass = await prisma.class.findUnique({
        where: { id: classId },
      });
      if (!targetClass)
        throw new Error("Selected class section does not exist.");

      const generatedUsername = `std${Date.now()}`;
      const generatedPassword = `Student@${new Date().getFullYear()}`;

      
     const { student: newStudent, admissionNumber } = await enrollStudent({
  schoolId,
  student: {
    username: generatedUsername,
    password: generatedPassword,

    name: application.firstName,
    surname: application.lastName,

    email: application.email,

    phone: application.phone,

    address: application.address,

    img: application.passportPhoto,

    bloodType: application.bloodGroup,

    birthday: application.dateOfBirth,

    sex: application.gender,

    levelId: targetClass.levelId,

    classId,

    parentId: null,
  },
});

      // 6. Finalize admission tracking logs status updates
      await prisma.admission.update({
  where: {
    id: admissionId,
  },
 data: {
  status: AdmissionStatus.ACCEPTED,
  studentId: newStudent.id,
  reviewedAt: new Date(),
  remarks: `Admitted into ${targetClass.name}. Student ID: ${newStudent.id}. Admission No: ${admissionNumber}`,
},
});
   // Refresh pages
revalidatePath("/admin/admissions");
revalidatePath(`/admin/admissions/${admissionId}`);
revalidatePath("/list/students");

revalidateTag("students", "max");
revalidateTag("admissions", "max");
revalidateTag(`dashboard-${schoolId}`, "max");

return {
  success: true,
  studentId: newStudent.id,
  admissionNumber,
};
  } catch (error: any) {
    console.error("Failed structural record conversion:", error);
    return {
      success: false,
      error:
        error.message || "Failed to finalize structural student conversion.",
    };
  }
}
