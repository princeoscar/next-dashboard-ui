"use server";

import { PrismaClient, AdmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAdmissionNumber } from "@/lib/utils/admissionNumber";



export async function submitPublicApplication(formData: {
  firstName: string;
  lastName: string;
  middleName?: string; // Added to match your layout fields safely
  email: string | null;
  phone: string;
  gender: any; 
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string | null;
  applyingLevelId: number;
  // Pin point your document upload strings here:
  passportPhoto: string;
  birthCertificate: string;
  reportCard: string;
}) {
  try {
    if (!formData.passportPhoto || !formData.birthCertificate || !formData.reportCard) {
      return { success: false, error: "Please ensure all required credentials have finished uploading." };
    }

    const schoolId = "1";

   
    const uniqueAppNumber = await generateAdmissionNumber(schoolId);

    const newApplication = await prisma.admission.create({
      data: {
        applicationNumber: uniqueAppNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        email: formData.email || null,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: new Date(formData.dateOfBirth),
        address: formData.address,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail || null,
        applyingLevelId: formData.applyingLevelId,
        passportPhoto: formData.passportPhoto,     // Saved securely to DB
        birthCertificate: formData.birthCertificate, // Saved securely to DB
        reportCard: formData.reportCard,             // Saved securely to DB
        status: AdmissionStatus.PENDING, 
        remarks: "Application submitted securely via public online enrollment portal.",

        state: "Pending Review", 
        lga: "Pending Review",
        schoolId: schoolId,
      },
    });

    return { success: true, applicationNumber: newApplication.applicationNumber };
  } catch (error: any) {
    console.error("Public submission failure transaction rollback:", error);
    return { success: false, error: error.message || "Failed to submit entry." };
  }
}