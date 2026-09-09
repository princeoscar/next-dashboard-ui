import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// 1. Attendance Specific
export async function sendAttendanceAlert(parentPhone: string, studentName: string, studentId: string) {
  const message = `Attendance Alert: Your child ${studentName} was marked as ABSENT today.`;
  
  const isSuccess = await triggerTermiiSms(parentPhone, message);

const { sessionClaims } = await auth();

const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  await prisma.notificationLog.create({
    data: {
      type: "ATTENDANCE",
      recipient: parentPhone,
      status: isSuccess ? "SENT" : "FAILED",
      message: message,
      studentId: studentId,
      channel: "SMS",
      schoolId,
      
    },
  });
  return isSuccess;
}

// 2. Result Specific
export async function sendResultNotification(
  parentPhone: string, 
  studentName: string, 
  subjectName: string, 
  score: number, 
  studentId: string
) {
  const message = `Result Alert: ${studentName} scored ${score} in ${subjectName}. View full details on your parent portal.`;
  
  const isSuccess = await triggerTermiiSms(parentPhone, message);

  const { sessionClaims } = await auth();

const schoolId = (sessionClaims?.metadata as any)?.schoolId;

  await prisma.notificationLog.create({
    data: {
      type: "RESULT",
      recipient: parentPhone,
      status: isSuccess ? "SENT" : "FAILED",
      message: message,
      studentId: studentId,
      channel: "EMAIL",
      schoolId,
      
    },
  });
  return isSuccess;
}

// 3. Helper to avoid repeating the fetch code
async function triggerTermiiSms(to: string, sms: string) {
  const response = await fetch("https://api.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      from: "RubixTech",
      sms,
      type: "plain",
      channel: "generic",
      api_key: process.env.TERMII_API_KEY,
    }),
  });
  const data = await response.json();
  return response.ok && data.message === "Successfully Sent";
}