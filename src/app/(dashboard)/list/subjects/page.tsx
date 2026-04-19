import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ClassSelector from "@/components/ClassSelector"; 
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { classId, search } = params;
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  if (role !== "admin") redirect(`/${role}`);

  // 1. DATA FOR SEGMENT VIEW (Classes)
  if (!classId && !search) {
    const classes = await prisma.class.findMany({
      include: { 
        grade: true,
        _count: { select: { lessons: true } } // Counts subjects/lessons in this class
      },
      orderBy: { name: "asc" },
    });

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Curriculum <span className="text-rubixPurple">Hub</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium italic">Select a class to manage its subjects</p>
        </div>
        <ClassSelector classes={classes} role={role} target="subjects" relatedData={{}} />
      </div>
    );
  }

  // 2. DATA FOR SUBJECT LIST VIEW (Specific Class or Search)
  const [subjects, teachers] = await prisma.$transaction([
    prisma.subject.findMany({
      where: {
        ...(classId ? { lessons: { some: { classId: parseInt(classId) } } } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      include: { teachers: true },
      orderBy: { name: "asc" },
    }),
    prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
  ]);

  const relatedData = { teachers };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/list/subjects" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {classId ? `Class Subjects` : "Search Results"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <TableSearch />
          <FormContainer table="subject" type="create" relatedData={relatedData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group relative hover:border-rubixPurple transition-all">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <FormContainer table="subject" type="update" data={subject} relatedData={relatedData} />
              <FormContainer table="subject" type="delete" id={subject.id} />
            </div>
            <h3 className="font-black text-lg text-slate-800">{subject.name}</h3>
            <div className="mt-4 flex flex-wrap gap-1">
              {subject.teachers.map((t) => (
                <span key={t.id} className="text-[10px] font-bold px-2 py-1 bg-white rounded-md text-slate-500 border border-slate-100">
                  {t.name} {t.surname}
                </span>
              ))}
            </div>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-slate-400 italic">No subjects assigned yet.</p>}
      </div>
    </div>
  );
};

export default SubjectListPage;