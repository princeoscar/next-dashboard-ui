"use server"

import { AdmissionStatus, UserSex } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateApplicationNumber } from "../admissions";
import { revalidatePath } from "next/cache";

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
        applyingClassId: data.applyingClassId ? Number(data.applyingClassId) : null,
        schoolId: data.schoolId,
        status: AdmissionStatus.PENDING,
        // 🎯 Maps file uploads cleanly into your schema fields
        passportPhoto: data.passportPhoto || null,
        birthCertificate: data.birthCertificate || null,
        reportCard: data.reportCard || null,
      },
    });

    revalidatePath("/admin/admissions"); // Keeps admin table fresh

    return { 
      success: true, 
      applicationNumber: newApplication.applicationNumber,
      id: newApplication.id 
    };

  } catch (error) {
    console.error("Admission Action Error:", error);
    return { 
      success: false, 
      error: "Something went wrong while submitting your application. Please try again." 
    };
  }
}

// --- PHASE 2: ADMIN STATUS PIPELINE (Approve/Reject actions) ---
export async function updateAdmissionStatus(id: string, status: AdmissionStatus, remarks?: string) {
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
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current application data
      const application = await tx.admission.findUnique({
        where: { id: admissionId },
      });

      if (!application) throw new Error("Admission record not found.");
      if (application.status === AdmissionStatus.ACCEPTED) {
        throw new Error("This applicant has already been admitted.");
      }

      // 2. Fetch the target class section using structural fields
      const targetClass = await tx.class.findUnique({
        where: { id: classId },
      });
      if (!targetClass) throw new Error("Selected class section does not exist.");

      // 3. Generate a sequential student ID code string
      const currentYear = new Date().getFullYear();
      const studentCount = await tx.student.count({
        where: {
          username: { startsWith: `std${currentYear}` },
        },
      });

      const formattedNumber = String(studentCount + 1).padStart(3, "0");
      const generatedUsername = `std${currentYear}${formattedNumber}`;

      // 4. Create the global authentication User Profile record
      const newUser = await tx.user.create({
        data: {
          id: generatedUsername,
          username: generatedUsername,
          role: "STUDENT", // 🎯 Handled as a clean literal string to completely bypass structural import errors
        },
      });

      // 5. Build out the official active Student record entry
    // 5. Build out the official active Student record entry
const newStudent = await tx.student.create({
  data: {
    id: newUser.username, 
    username: newUser.username,
    clerkId: newUser.username,                       // 🎯 Added required auth integration link
    name: application.firstName,                    // 🎯 Adjusted to hold first name if surname is separate
    surname: application.lastName,                  // 🎯 Added required field
    phone: application.phone,
    sex: application.gender,         
    birthday: new Date(application.dateOfBirth), 
    img: application.passportPhoto || null, 
    address: application.address || "No Address Provided", // 🎯 Added required field
    classId: classId,
    levelId: targetClass.levelId,    
    schoolId: schoolId,
  },
});

      // 6. Finalize admission tracking logs status updates
      await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: AdmissionStatus.ACCEPTED,
          remarks: `Admitted into ${targetClass.name} with Student ID: ${generatedUsername}`,
          reviewedAt: new Date(),
        },
      });

      return { success: true, studentId: newStudent.id };
    });

    // Refresh dynamic admin layouts
    revalidatePath("/admin/admissions");
    revalidatePath(`/admin/admissions/${admissionId}`);

  } catch (error: any) {
    console.error("Failed structural record conversion:", error);
    return { success: false, error: error.message || "Failed to finalize structural student conversion." };
  }
}
