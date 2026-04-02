import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ChevronRight, BookOpen, Users } from "lucide-react";

const SelectClassPage = async () => {
  const { userId } = await auth();

  // 1. Get all lessons this teacher is responsible for
  const lessons = await prisma.lesson.findMany({
    where: { teacherId: userId! },
    include: {
      class: true,
      subject: true,
      exams: { select: { id: true, title: true } },
      assignment: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Grade Recording</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select a class and assessment to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h2 className="font-black text-slate-800 leading-none">{lesson.class.name}</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{lesson.subject.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Available Assessments</p>
              
              {/* List Exams */}
              {lesson.exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/list/results/bulk?examId=${exam.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-slate-400 group-hover:text-slate-500" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-white uppercase tracking-tight">{exam.title}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
                </Link>
              ))}

              {lesson.exams.length === 0 && (
                <p className="text-[10px] italic text-slate-400">No exams scheduled yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectClassPage;