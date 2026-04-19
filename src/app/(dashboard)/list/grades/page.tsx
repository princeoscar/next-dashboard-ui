import FormModal from "@/components/FormModal";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination"; // Assuming you have this
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Grade, Prisma } from "@prisma/client";
import Image from "next/image";

const GradeListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  // NEXT.JS 15 FIX: You must await searchParams
  const resolvedParams = await searchParams;
  const { page, ...queryParams } = resolvedParams;
  
  const p = page ? parseInt(page) : 1;

  // URL QUERY PARAMS CONDITION
  const query: Prisma.GradeWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            const searchTerm = parseInt(value);
            if (!isNaN(searchTerm)) {
              query.level = { equals: searchTerm };
            }
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.grade.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.grade.count({ where: query }),
  ]);

  const columns = [
    {
      header: "Grade Name",
      accessor: "name",
    },
    {
      header: "Level",
      accessor: "level",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: Grade) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 dark:border-slate-800 even:bg-slate-50 dark:even:bg-slate-900/50 text-sm hover:bg-rubixPurpleLight dark:hover:bg-slate-800 transition-colors"
    >
      <td className="flex items-center gap-4 p-4 dark:text-slate-300">{item.name}</td>
      <td className="hidden md:table-cell dark:text-slate-400">{item.level}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal table="grade" type="update" data={item} />
          <FormModal table="grade" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl flex-1 m-4 mt-0 border border-slate-100 dark:border-slate-800 transition-colors">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold dark:text-slate-100">All Grades</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-rubixYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-rubixYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="grade" type="create" />
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default GradeListPage;