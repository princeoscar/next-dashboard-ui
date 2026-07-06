import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$connect();

    const count = await prisma.school.count();

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        success: false,
        error: e.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}