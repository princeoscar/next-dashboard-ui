import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { saveBulkResultsAction } from "@/lib/actions";
import BulkResultForm from "@/components/forms/BulkResultForm";

const BulkEntryPage = async ({
   searchParams, 
  }: {
     searchParams: Promise<{ examId: string }>
     }) => {
      const params = await searchParams;

  const examId = params.examId;

 if (!examId) return <div>No Exam ID provided</div>;

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

  if (!exam) return notFound();

  // Bind the exam ID to the server action
  const updateActionWithId = saveBulkResultsAction.bind(null, exam.id);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Grading: {exam.title}</h1>
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