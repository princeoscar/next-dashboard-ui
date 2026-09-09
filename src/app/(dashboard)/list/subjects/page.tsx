import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ClassSelector from "@/components/ClassSelector";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Subject, Teacher, Level, Class, Stream, SubjectAssignment } from "@prisma/client";

// 1. Define the interface so TypeScript knows what is inside 'subject'
interface SubjectWithRelations extends Subject {
  teachers: Teacher[];

  curriculum: {
    id: number;
    level: Level;
    stream: {
      id: number;
      name: string;
    } | null;
  }[];
}

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

  // --- 1. FETCH RELATED DATA ONCE FOR USE IN FORMS ---
  const [teachers, levels, streams] = await prisma.$transaction([
  prisma.teacher.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
    },
  }),

  prisma.level.findMany({
    select: {
      id: true,
      name: true,
    },
  }),

  prisma.stream.findMany({
    orderBy: {
      name: "asc",
    },
  }),
]);

  const relatedData = {
  teachers,
  levels,
  streams,
};

  // --- 2. DATA FOR SEGMENT VIEW (Classes) ---
  if (!classId && !search) {
   const classes = await prisma.class.findMany({
  include: {
    level: true,
    stream: true,
    _count: {
      select: {
        students: true,
      },
    },
  },
  orderBy: [
    {
      level: {
        level: "asc",
      },
    },
    {
      name: "asc",
    },
  ],
});


// Get all curriculum assignments
const curriculum = await prisma.subjectAssignment.findMany({
  select: {
    levelId: true,
    streamId: true,
  },
});

const classesWithSubjectCount = classes.map((cls) => {
  const totalSubjects = curriculum.filter((item) => {
    // General subjects for the level
    if (
      item.levelId === cls.levelId &&
      item.streamId === null
    ) {
      return true;
    }

    // Stream-specific subjects
    if (
      item.levelId === cls.levelId &&
      item.streamId === cls.streamId
    ) {
      return true;
    }

    return false;
  }).length;

  return {
    ...cls,
    curriculumCount: totalSubjects,
  };
});

    return (
      <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase text-center md:text-left">
              Curriculum <span className="text-rubixPurple">Hub</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium italic">Select a class to manage its subjects</p>
          </div>
          {/* <FormContainer table="subject" type="create" relatedData={relatedData} /> */}
        </div>
       <ClassSelector
    classes={classesWithSubjectCount}
    role={role}
    target="subjects"
    relatedData={relatedData}
/>
      </div>
    );
  }

  const currentClass = classId
  ? await prisma.class.findUnique({
      where: {
        id: Number(classId),
      },
      select: {
        levelId: true,
        streamId: true,
      },
    })
  : null;

  console.log("CURRENT CLASS");
console.log(currentClass);

// Then fetch ONLY the assignments for that class

console.log("Searching with:");
console.log({
  levelId: currentClass?.levelId,
  streamId: currentClass?.streamId,
});
const assignments = classId
  ? await prisma.subjectAssignment.findMany({
     where: {
  levelId: currentClass?.levelId,

  OR: [
    {
      streamId: null,
    },
    {
      streamId: currentClass?.streamId,
    },
  ],
},

      include: {
        subject: {
          include: {
            teachers: true,
          },
        },

        level: true,
        stream: true,
      },

      orderBy: {
        subject: {
          name: "asc",
        },
      },
    })
  : [];

  console.log("Found assignments:");
console.table(assignments);

  console.log("Current Class:", currentClass);
console.log("Assignments:");
console.dir(assignments, { depth: null });

  return (
    <div className="bg-white p-8 rounded-[2.5rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <Link href="/list/subjects" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {classId ? `Class Subjects` : "Search Results"}
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <TableSearch />
          <FormContainer table="subject" type="create" relatedData={relatedData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => {
          // 🎯 Logic Block: Calculate unique levels for this specific subject card
          const assignments = [assignment];

          return (
            <div key={assignment.subject.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group relative hover:border-rubixPurple transition-all">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <FormContainer table="subject" type="update" data={assignment.subject} relatedData={relatedData} />
                <FormContainer table="subject" type="delete" id={assignment.subject.id} />
              </div>
              <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{assignment.subject.name}</h3>

              <div className="mt-3 flex flex-wrap gap-2">
  {assignments.map((a) => (
    <span
      key={a.id}
      className="text-[10px] bg-rubixPurple/10 text-rubixPurple px-3 py-1 rounded-full font-bold"
    >
      {a.level.name}
      {a.stream ? ` • ${a.stream.name}` : ""}
    </span>
  ))}
</div>

              <div className="mt-4 flex flex-wrap gap-1">
                {assignment.subject.teachers?.map((t: Teacher) => (
                  <span key={t.id} className="text-[10px] font-bold px-2 py-1 bg-white rounded-md text-slate-500 border border-slate-100">
                    {t.firstName} {t.lastName}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-slate-400 italic">No subjects assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectListPage;