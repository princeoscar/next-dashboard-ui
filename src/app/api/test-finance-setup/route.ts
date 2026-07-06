// src/app/api/test-finance-setup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Create a baseline target category item
    const category = await prisma.feeCategory.create({
      data: {
        name: "First Term Mock Tuition",
        description: "Standard validation testing invoice package structure.",
      },
    });

    // 2. Allocate the fee to a class level group
    const allocation = await prisma.feeAllocation.create({
      data: {
        feeCategoryId: category.id,
        levelId: 1, // Assumes a base level profile exists
        amount: 45000.00, // ₦45,000 Tuition Fee
        term: "FIRST",
        academicYear: "2026/2027",
      },
    });

    // 3. Bind the allocation item directly to a test student profile id
    const testBalance = await prisma.studentBalance.create({
      data: {
        studentId: "STU-TEST-999", // Make sure this matches an existing student id string if you have foreign key checks enabled
        feeAllocationId: allocation.id,
        totalAssigned: 45000.00,
        paidAmount: 0.00,
        outstanding: 45000.00,
        status: "UNPAID",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test environment seeded!",
      studentId: testBalance.studentId,
      studentBalanceId: testBalance.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}