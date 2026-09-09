import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Lesson, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import ClassFilter from "@/components/ClassFilter";

export type LessonList = Lesson & {
  subject: {
    id: number;
    name: string;
  };

  class: {
    id: number;
    name: string;
  };

  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = await searchParams;
  const p = page ? parseInt(page) : 1;
  const query: Prisma.LessonWhereInput = {};

  const columns = [
    { header: "Subject Name", accessor: "name" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Day", accessor: "day", className: "hidden lg:table-cell" }, // New
    { header: "Time", accessor: "time", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
           query.OR = [
  {
    subject: {
      name: {
        contains: value,
        mode: "insensitive",
      },
    },
  },
  {
    teacher: {
      firstName: {
        contains: value,
        mode: "insensitive",
      },
    },
  },
  {
    teacher: {
      lastName: {
        contains: value,
        mode: "insensitive",
      },
    },
  },
  {
    class: {
      name: {
        contains: value,
        mode: "insensitive",
      },
    },
  },
];
            break;
        }
      }
    }
  }

  const [data, count, subjects, classes, teachers, levels, streams,] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
     include: {
  subject: {
    select: {
      id: true,
      name: true,
    },
  },

  class: {
  select: {
    id: true,
    name: true,
  },
},

  teacher: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
},
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),



    prisma.lesson.count({ where: query }),


    prisma.subject.findMany({ select: { id: true, name: true } }),
    
    prisma.class.findMany({
  select: {
    id: true,
    name: true,
    levelId: true,
    streamId: true,
  },
  orderBy: {
    name: "asc",
  },
}),

    prisma.teacher.findMany({ select: { id: true, firstName: true, lastName: true } }),

    prisma.level.findMany({
  select: {
    id: true,
    name: true,
  },
  orderBy: {
    id: "asc",
  },
}),

prisma.stream.findMany({
  select: {
    id: true,
    name: true,
  },
  orderBy: {
    name: "asc",
  },
}),
  ]);

  const relatedData = { subjects, classes, teachers, levels, streams };

  const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const dayColors: { [key: string]: string } = {
    MONDAY: "bg-blue-100 text-blue-700",
    TUESDAY: "bg-purple-100 text-purple-700",
    WEDNESDAY: "bg-yellow-100 text-yellow-700",
    THURSDAY: "bg-pink-100 text-pink-700",
    FRIDAY: "bg-orange-100 text-orange-700",
  };

  const renderRow = (item: LessonList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>
      <td>{item.class.name}</td>
      <td className="hidden md:table-cell">{item.teacher.firstName + " " + item.teacher.lastName}</td>

      {/* 1. Day Column */}
      <td className="hidden lg:table-cell">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${dayColors[item.day] || "bg-gray-100"}`}>
          {item.day}
        </span>
      </td>

      {/* 2. Time Column */}
      <td className="hidden lg:table-cell">
  {formatTime(item.startTime)} - {formatTime(item.endTime)}
</td>

      {/* 3. Actions Column */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={item} relatedData={relatedData} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
   <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

  {/* TOP SECTION */}
  <div className="flex items-center justify-between mb-4">
    <h1 className="text-lg font-semibold">
      Timetable Periods
    </h1>

    <div className="flex items-center gap-2">
      <TableSearch />

      <ClassFilter classes={classes} />

      {role === "admin" && (
        <FormContainer
          table="lesson"
          type="create"
          relatedData={relatedData}
        />
      )}
    </div>
  </div>

  {/* LESSON LIST */}
  <Table
    columns={columns}
    renderRow={renderRow}
    data={data}
  />

  {/* PAGINATION */}
  <Pagination
    page={p}
    count={count}
  />

</div>
  );
};

export default LessonListPage;