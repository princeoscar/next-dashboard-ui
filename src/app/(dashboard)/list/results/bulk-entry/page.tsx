import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { saveBulkResultsAction } from "@/lib/actions";
import BulkResultForm from "@/components/forms/BulkResultForm";

const BulkEntryPage = async ({ searchParams }: { searchParams: { examId: string } }) => {
  const { examId } = searchParams;

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

  // We bind the examId here on the server
  const updateActionWithId = saveBulkResultsAction.bind(null, exam.id);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
          Grading: {exam.title}
        </h1>
      </div>
      
      {/* We pass the pre-bound action and the students to the client component */}
      <BulkResultForm 
        students={exam.lesson.class.students} 
        action={updateActionWithId} 
      />
    </div>
  );
};

export default BulkEntryPage;