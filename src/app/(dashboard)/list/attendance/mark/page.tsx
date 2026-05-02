import AttendanceForm from "@/components/forms/AttendanceForm";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";



const MarkAttendancePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; subjectId?: string }>;
}) => {
  const { userId } = await auth();
  const { classId, subjectId } = await searchParams;

  if (!classId || !subjectId) {
    redirect("/list/classes?target=attendance");
  }

  // 1. Fetch Students
  const students = await prisma.student.findMany({
    where: { classId: parseInt(classId) },
    orderBy: { name: "asc" },
  });

  // 2. Fetch the Lesson
  const subject = await prisma.subject.findUnique({
  where: { id: parseInt(subjectId) },
  // 🎯 Change 'class' to 'classes' and remove the redundant 'subject' include
  include: { 
    classes: {
      select: { id: true, name: true }
    } 
  },
});

  return (
    <div className="bg-white p-8 rounded-[2.5rem] m-4 mt-0 shadow-sm border border-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Take Attendance
        </h1>
       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
        {/* 🎯 Updated mapping to handle the classes array */}
        {subject?.name} — {subject?.classes[0]?.name || "No Class Assigned"}
      </p>
      </div>

      <AttendanceForm 
        type="create" 
        // ✅ PASS AN EMPTY ARROW FUNCTION
        // Since this isn't a modal, it doesn't need to 'close' anything
        setOpen={() => {}} 
        relatedData={{ 
          students: students, 
          subjects: [subject], 
        }}
      />
    </div>
  );
};

export default MarkAttendancePage;