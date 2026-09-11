import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Level, Prisma } from "@prisma/client";
import FormModal from "@/components/FormModal";
import Image from "next/image";

const LevelListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const resolvedParams = await searchParams;
  const { page, ...queryParams } = resolvedParams;

  const school = await prisma.school.findFirst();
  const p = page ? parseInt(page) : 1;

  const query: Prisma.LevelWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { name: { contains: value, mode: 'insensitive' } },
              ...(!isNaN(parseInt(value)) ? [{ level: { equals: parseInt(value) } }] : [])
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.level.findMany({
      where: query,
      orderBy: { level: "asc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.level.count({ where: query }),
  ]);

  const columns = [
    {
      header: "Grade Name",
      accessor: "name",
      className: "pl-6",
    },
    {
      header: "Level",
      accessor: "level",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
      className: "text-right pr-6",
    },
  ];

  const renderRow = (item: Level) => (
    <tr
      key={item.id}
      className="border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50/80 transition-all group"
    >
      <td className="flex items-center gap-4 p-4 pl-6 font-black text-slate-700 uppercase text-xs">
        {item.name}
      </td>
      <td className="hidden md:table-cell font-mono text-xs font-bold text-rubixPurple">
        {item.level}
      </td>
      <td className="p-4 pr-6 text-right">
        <div className="flex items-center gap-2 justify-end">
          <FormModal table="level" type="update" data={item} schoolId={item.schoolId} />
          <FormModal table="level" type="delete" id={item.id} schoolId={item.schoolId} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
      {/* TOP */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
              All <span className="text-rubixPurple">Grades</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Levels: {count}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <TableSearch />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
              <Image src="/filter.png" alt="" width={16} height={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100">
              <Image src="/sort.png" alt="" width={16} height={16} />
            </button>
            <FormModal table="level" type="create" schoolId={school!.id} />
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-[1rem] md:rounded-[2rem] border border-slate-50 overflow-x-auto bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* PAGINATION */}
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default LevelListPage;