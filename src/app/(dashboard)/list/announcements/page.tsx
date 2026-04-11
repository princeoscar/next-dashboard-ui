import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma"; // Changed to default import to match your standard
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class, Prisma } from "@prisma/client";
import { Megaphone, Globe, Users } from "lucide-react";

type AnnouncementList = Announcement & { class: Class | null };

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {

     const params = await searchParams;


  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  const p = params.page ? parseInt(params.page) : 1;

  // --- 1. SEARCH & ROLE FILTERING LOGIC ---
  const query: Prisma.AnnouncementWhereInput = {};

  if (params.search) {
    query.title = { contains: params.search, mode: "insensitive" };
  }

  // ROLE-BASED VISIBILITY: 
  if (role !== "admin") {
    // If no userId, return empty or global only to be safe
    const currentUserId = userId || ""; 

    const roleConditions = {
      teacher: { lessons: { some: { teacherId: currentUserId } } },
      student: { students: { some: { id: currentUserId } } },
      parent: { students: { some: { parentId: currentUserId } } },
    };

    query.OR = [
      { classId: null }, 
      { 
        class: roleConditions[role as keyof typeof roleConditions] || { id: -1 } 
      },
    ];
  }

  // --- 2. DATA FETCHING ---
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: "desc" },
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // --- 3. TABLE CONFIGURATION ---
  const columns = [
    { header: "Announcement", accessor: "title" },
    { header: "Target Audience", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date Published", accessor: "date", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: AnnouncementList) => (
    <tr key={item.id} className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-lg group-hover:bg-rubixPurple group-hover:text-white transition-all">
            <Megaphone size={16} />
          </div>
          <div>
            <span className="font-bold text-slate-700 block">{item.title}</span>
            <span className="text-[10px] text-slate-400 md:hidden block mt-1">
              {item.class ? item.class.name : "Global"}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        {item.class ? (
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
            <Users size={12} /> {item.class.name}
          </div>
        ) : (
          <div className="flex items-center gap-2 w-fit px-3 py-1 bg-rubixSky/10 text-rubixSky rounded-full text-[10px] font-black uppercase tracking-widest border border-rubixSky/20 shadow-sm">
            <Globe size={12} /> Global
          </div>
        )}
      </td>
      <td className="hidden lg:table-cell p-4 text-slate-400 font-medium">
        {new Intl.DateTimeFormat("en-GB", { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }).format(new Date(item.date))}
      </td>
      {role === "admin" && (
        <td className="p-4 text-right">
          <div className="flex items-center gap-2 justify-end">
            <FormContainer table="announcement" type="update" data={item} />
            <FormContainer table="announcement" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-6 rounded-[2rem] flex-1 m-4 mt-0 shadow-sm border border-slate-100 min-h-[600px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Board Updates</h1>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">
            {role === "admin" ? "Manage school-wide communications" : "View latest school notices"}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && (
              <div className="p-1 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                <FormContainer table="announcement" type="create" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-50 overflow-hidden shadow-inner">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default AnnouncementListPage;