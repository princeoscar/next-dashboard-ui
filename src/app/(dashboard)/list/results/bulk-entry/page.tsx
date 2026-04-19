import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { saveBulkResultsAction } from "@/lib/actions";
import BulkResultForm from "@/components/forms/BulkResultForm";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, ClipboardCheck, GraduationCap } from "lucide-react";
import Link from "next/link";

const BulkEntryPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ examId: string }>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // Security: Only staff can enter results
  if (role !== "admin" && role !== "teacher") redirect("/");

  const params = await searchParams;
  const examId = params.examId;

  if (!examId) redirect("/list/exams");

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

  // Bind the exam ID to the server action so the action knows WHICH exam to update
  const updateActionWithId = saveBulkResultsAction.bind(null, exam.id);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link 
            href="/list/exams" 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={24} className="text-blue-600" />
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Bulk <span className="text-blue-600">Grading</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">
                 {exam.lesson.subject.name}
               </span>
               <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">
                 Class {exam.lesson.class.name}
               </span>
               <span className="text-[10px] text-slate-400 font-bold italic ml-1">
                 — {exam.title}
               </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-300">
          <GraduationCap size={32} strokeWidth={1} />
        </div>
      </div>

      {/* THE FORM COMPONENT */}
      <div className="mt-4">
        <BulkResultForm 
          students={exam.lesson.class.students} 
          action={updateActionWithId} 
        />
      </div>
    </div>
  );
};

export default BulkEntryPage;