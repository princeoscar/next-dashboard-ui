import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { saveBulkResultsAction } from "@/lib/actions";
import BulkResultForm from "@/components/forms/BulkResultForm";

const BulkEntryPage = async ({ searchParams }: { searchParams: { examId: string } }) => {
  const { examId } = await searchParams;

  // 1. Guard Clause: Check validity BEFORE calling Prisma
  if (!examId || isNaN(Number(examId))) {
    return (
      <div className="p-8 text-slate-500 italic">
        Invalid Exam Selection. Please return to the exam list.
      </div>
    );
  }

  // 2. Safe Prisma Call
  const exam = await prisma.exam.findUnique({
    where: { id: parseInt(examId) },
    include: {
      lesson: {
        include: {
          class: { include: { students: { orderBy: { name: "asc" } } } },
          subject: true,
        },
      },
    },
  });

  // 3. Not Found Check
  if (!exam) return notFound();

  // 4. Server Action Binding
  const updateActionWithId = saveBulkResultsAction.bind(null, exam.id);

  // 5. Successful Render
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Grading: {exam.title}
        </h1>
        <p className="text-slate-500 text-sm">
          Subject: {exam.lesson.subject.name} | Class: {exam.lesson.class.name}
        </p>
      </div>
      
      <BulkResultForm 
        students={exam.lesson.class.students} 
        action={updateActionWithId} 
      />
    </div>
  );
};

export default BulkEntryPage;