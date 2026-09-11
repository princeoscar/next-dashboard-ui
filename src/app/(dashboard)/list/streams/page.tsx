import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import Image from "next/image";

const StreamListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;
     
  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: userId!,
    },
    select: {
      schoolId: true,
    },
  });
   
  if (!admin) {
    throw new Error("Admin not found.");
  }

  const schoolId = admin.schoolId;

  if (!schoolId) {
    throw new Error("School not found.");
  }

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search;

  const query: Prisma.StreamWhereInput = {
    schoolId,
  };

  if (search) {
    query.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [streams, count] = await prisma.$transaction([
    prisma.stream.findMany({
      where: query,
      include: {
        classes: {
          orderBy: {
            name: "asc",
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      orderBy: {
        name: "asc",
      },
    }),
    prisma.stream.count({
      where: query,
    }),
  ]);

  const columns = [
    {
      header: "Stream",
      accessor: "name",
      className: "pl-6",
    },
    {
      header: "Classes",
      accessor: "classes",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
            className: "text-right pr-6",
          },
        ]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-slate-50 last:border-0 text-sm hover:bg-slate-50/80 transition-all group"
    >
      <td className="p-4 pl-6 font-black text-slate-700 uppercase text-xs">
        {item.name}
      </td>

      <td className="p-4">
        {item.classes.length === 0 ? (
          <span className="text-slate-400 text-xs italic">
            No Classes Assigned
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {item.classes.map((cls: any) => (
              <span
                key={cls.id}
                className="rounded-lg bg-rubixPurpleLight/50 px-2.5 py-1 text-[10px] font-bold text-rubixPurple border border-rubixPurple/10"
              >
                {cls.name}
              </span>
            ))}
          </div>
        )}
      </td>

      {role === "admin" && (
        <td className="p-4 pr-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <FormContainer
              table="stream"
              type="update"
              data={item}
            />
            <FormContainer
              table="stream"
              type="delete"
              id={item.id}
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex-1 m-1 md:m-4 mt-0 shadow-sm border border-slate-100">
      {/* TOP */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            All <span className="text-rubixPurple">Streams</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Total Streams: {count}
          </p>
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
            {role === "admin" && <FormContainer table="stream" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-[1rem] md:rounded-[2rem] border border-slate-50 overflow-x-auto bg-white shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={streams} />
      </div>

      {/* PAGINATION */}
      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={page} count={count} />
      </div>
    </div>
  );
};

export default StreamListPage;