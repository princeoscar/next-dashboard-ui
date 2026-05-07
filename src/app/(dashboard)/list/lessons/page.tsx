import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import ClassFilter from "@/components/ClassFilter"; // 🎯 Import the new component
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Lesson, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

export type LessonList = Lesson & {
  subject: { name: string };
  class: { name: string };
  teacher: { name: string; surname: string };
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
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
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
        }
      }
    }
  }

  const [data, count, subjects, classes, teachers] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
    prisma.subject.findMany({ select: { id: true, name: true } }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.teacher.findMany({ select: { id: true, name: true, surname: true } }),
  ]);

  const relatedData = { subjects, classes, teachers };

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
      <td className="hidden md:table-cell">{item.teacher.name + " " + item.teacher.surname}</td>

      {/* 1. Day Column */}
      <td className="hidden lg:table-cell">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${dayColors[item.day] || "bg-gray-100"}`}>
          {item.day}
        </span>
      </td>

      {/* 2. Time Column */}
      <td className="hidden lg:table-cell">
        {new Date(item.startTime).toISOString().substr(11, 5)} - 
{new Date(item.endTime).toISOString().substr(11, 5)}
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
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex flex-col gap-4">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Timetable Periods</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="lesson" type="create" relatedData={relatedData} />
            )}
          </div>
        </div>
      </div>

      {/* 🎯 THE CLASS FILTER */}
      <div className="border-b border-slate-100 pb-2">
        <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Select Class Timetable</p>
        <ClassFilter classes={classes} />
      </div>

      {/* LIST SECTION */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;