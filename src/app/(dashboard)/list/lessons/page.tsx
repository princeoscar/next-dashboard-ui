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
    { header: "Subject Name", accessor: "name", className: "pl-4" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Day & Time", accessor: "schedule", className: "hidden sm:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action", className: "pr-4 text-right" }] : []),
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

  const [data, count, subjects, classes, teachers, levels, streams] = await prisma.$transaction([
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
    <tr key={item.id} className="border-b border-slate-100 even:bg-slate-50/60 text-xs md:text-sm hover:bg-slate-100/80 transition-all">
      <td className="p-4 pl-4 font-bold text-slate-700">
        <div className="flex flex-col">
          <span>{item.subject.name}</span>
          {/* Mobile-only view for Day & Time below the subject name */}
          <span className="sm:hidden text-[10px] text-slate-400 font-medium mt-0.5">
            {item.day} • {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </span>
        </div>
      </td>
      <td className="p-4 font-semibold text-slate-600">{item.class.name}</td>
      <td className="hidden md:table-cell p-4 text-slate-600">
        {item.teacher.firstName + " " + item.teacher.lastName}
      </td>
      <td className="hidden sm:table-cell p-4">
        <div className="flex flex-col gap-1 items-start">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${dayColors[item.day] || "bg-gray-100"}`}>
            {item.day}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </span>
        </div>
      </td>
      {role === "admin" && (
        <td className="p-4 pr-4 text-right">
          <div className="flex items-center justify-end gap-1 md:gap-2">
            <FormContainer table="lesson" type="update" data={item} relatedData={relatedData} />
            <FormContainer table="lesson" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
      {/* TOP SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Timetable <span className="text-rubixPurple">Periods</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Manage school lessons and schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
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
      <div className="rounded-[1rem] md:rounded-[2rem] border border-slate-50 overflow-x-auto bg-white shadow-sm">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={data}
        />
      </div>

      {/* PAGINATION */}
      <div className="mt-6 border-t border-slate-50 pt-4">
        <Pagination
          page={p}
          count={count}
        />
      </div>
    </div>
  );
};

export default LessonListPage;