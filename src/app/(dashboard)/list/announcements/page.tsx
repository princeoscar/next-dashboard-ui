import ClassSelector from "@/components/ClassSelector";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Prisma } from "@prisma/client";
import { Megaphone, Globe, Users, ArrowLeft, GraduationCap, User } from "lucide-react";
import Link from "next/link";

type AnnouncementList = Announcement & {
  class: {
    id: number;
    name: string;
  } | null;

  level: {
    id: number;
    name: string;
  } | null;

  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  // ============================================================
  // 1. AUTHENTICATION
  // ============================================================

  const params = await searchParams;

  const { sessionClaims, userId } = await auth();
  

  const metadata = sessionClaims?.metadata as {
    role?: string;
      };

  const role = metadata?.role?.toLowerCase();

  // Fetch the correct schoolId directly from the admin database table
  const admin = await prisma.admin.findUnique({
    where: { clerkId: userId! },
    select: { schoolId: true },
  });

  const schoolId = admin?.schoolId;
  

  // ============================================================
  // 2. BASIC PARAMS
  // ============================================================

  const p = params.page ? parseInt(params.page, 10) : 1;

  const levelId = params.levelId;
  const search = params.search;

  // ============================================================
  // 3. BASE QUERY
  // ============================================================

  const query: Prisma.AnnouncementWhereInput = {
    schoolId: schoolId,
  };

  // Search by announcement title
  if (search) {
    query.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  // ============================================================
  // 4. ROLE-BASED VISIBILITY
  // ============================================================

  if (role !== "admin") {
    const currentUserId = userId || "";

    // ----------------------------------------------------------
    // GLOBAL ANNOUNCEMENTS
    // ----------------------------------------------------------

    const visibilityConditions: Prisma.AnnouncementWhereInput[] = [
      {
        classId: null,
        levelId: null,
        teacherId: null,
      },
    ];

    // ----------------------------------------------------------
    // TEACHER
    // ----------------------------------------------------------

    if (role === "teacher") {
      visibilityConditions.push(
        {
          teacherId: currentUserId,
        },
        {
          class: {
            OR: [
              {
                supervisorId: currentUserId,
              },
              {
                subjects: {
                  some: {
                    teachers: {
                      some: {
                        id: currentUserId,
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      );
    }

    // ----------------------------------------------------------
    // STUDENT
    // ----------------------------------------------------------

    if (role === "student") {
      visibilityConditions.push(
        {
          class: {
            students: {
              some: {
                id: currentUserId,
              },
            },
          },
        },
        {
          level: {
            students: {
              some: {
                id: currentUserId,
              },
            },
          },
        }
      );
    }

    // ----------------------------------------------------------
    // PARENT
    // ----------------------------------------------------------

    if (role === "parent") {
      visibilityConditions.push(
        {
          class: {
            students: {
              some: {
                parentId: currentUserId,
              },
            },
          },
        },
        {
          level: {
            students: {
              some: {
                parentId: currentUserId,
              },
            },
          },
        }
      );
    }

    // ----------------------------------------------------------
    // APPLY VISIBILITY CONDITIONS
    // ----------------------------------------------------------

    query.OR = visibilityConditions;
  }

  // ============================================================
  // 5. LEVEL FILTER
  // ============================================================

  if (levelId) {
    const parsedLevelId = parseInt(levelId, 10);

    if (!Number.isNaN(parsedLevelId)) {
      // Show announcements matching this level OR global announcements (levelId is null)
      query.OR = [
        { levelId: parsedLevelId },
        { levelId: null },
      ];

      // If not admin, combine this OR condition with the role visibility requirements
      if (role !== "admin" && query.OR) {
        // Wrap previous restrictions if needed, or ensure they merge cleanly with Prisma AND
        query.AND = [
          {
            OR: [
              { levelId: parsedLevelId },
              { levelId: null },
            ],
          },
        ];
        delete query.OR;
      }
    }
  } else {
    // Optional: If you want the main "Notice Registry" (when no level folder is clicked) 
    // to show all announcements, you don't need an extra filter. 
    // But if you want it to *only* show global ones or everything, it defaults to schoolId.
  }

 // ============================================================
  // 6. SEGMENT VIEW (Levels instead of Classes)
  // ============================================================

  if (
    !levelId &&
    !search &&
    (role === "admin" || role === "teacher")
  ) {
    const levels = await prisma.level.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
          },
        },
      },
      orderBy: {
        level: "asc", // Adjust based on your level sorting field (e.g., 'name' or 'level')
      },
    });

    return (
      <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100">
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Megaphone size={28} className="text-indigo-600" />
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
              Notice <span className="text-indigo-600">Board</span>
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium italic uppercase tracking-widest mt-1">
            Select a level folder to manage announcements
          </p>
        </div>

        <ClassSelector
          classes={levels} // Passing levels data into your selector component
          role={role || ""}
          target="announcements"
          relatedData={{}}
        />
      </div>
    );
  }

  // ============================================================
  // 7. FETCH DATA
  // ============================================================

  const [data, count, classes, levels, teachers] =
    await prisma.$transaction([
      // --------------------------------------------------------
      // ANNOUNCEMENTS
      // --------------------------------------------------------

      prisma.announcement.findMany({
        where: query,

        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },

          level: {
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

        orderBy: {
          publishedAt: "desc",
        },
      }),

      // --------------------------------------------------------
      // COUNT
      // --------------------------------------------------------

      prisma.announcement.count({
        where: query,
      }),

      // --------------------------------------------------------
      // CLASSES
      // --------------------------------------------------------

      prisma.class.findMany({
        where: {
          schoolId: schoolId,
        },

        select: {
          id: true,
          name: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      // --------------------------------------------------------
      // LEVELS
      // --------------------------------------------------------

      prisma.level.findMany({
        where: {
          schoolId: schoolId,
        },

        select: {
          id: true,
          name: true,
        },

        orderBy: {
          level: "asc",
        },
      }),

      // --------------------------------------------------------
      // TEACHERS
      // --------------------------------------------------------

      prisma.teacher.findMany({
        where: {
          schoolId: schoolId,
          status: "ACTIVE",
        },

        select: {
          id: true,
          firstName: true,
          lastName: true,
        },

        orderBy: {
          lastName: "asc",
        },
      }),
    ]);

  // ============================================================
  // 8. DATA FOR ANNOUNCEMENT FORM
  // ============================================================

  const relatedData = {
    classes,
    levels,
    teachers,
  };

  // ============================================================
  // 9. TABLE COLUMNS
  // ============================================================

  const columns = [
    {
      header: "Announcement",
      accessor: "title",
      className: "pl-4",
    },

    {
      header: "Target Audience",
      accessor: "target",
      className: "hidden md:table-cell",
    },

    {
      header: "Date Published",
      accessor: "date",
      className: "hidden lg:table-cell",
    },

    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
            className: "text-right pr-4",
          },
        ]
      : []),
  ];

  // ============================================================
  // 10. TABLE ROW
  // ============================================================

  const renderRow = (item: AnnouncementList) => {
    return (
      <tr
        key={item.id}
        className="border-b border-slate-100 last:border-0 text-sm hover:bg-slate-50/50 transition-colors group"
      >
        {/* ---------------------------------------------------- */}
        {/* ANNOUNCEMENT */}
        {/* ---------------------------------------------------- */}

        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
              <Megaphone size={16} />
            </div>

            <div className="flex flex-col max-w-[200px] md:max-w-md">
              <span className="font-bold text-slate-700 block tracking-tight truncate">
                {item.title}
              </span>

              <span className="text-[11px] text-slate-500 line-clamp-1">
                {item.description}
              </span>
            </div>
          </div>
        </td>

        {/* ---------------------------------------------------- */}
        {/* TARGET AUDIENCE */}
        {/* ---------------------------------------------------- */}

        <td className="hidden md:table-cell p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* CLASS TARGET */}
            {item.class && (
              <div className="flex items-center gap-2 w-fit px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                <Users size={12} />
                {item.class.name}
              </div>
            )}

            {/* LEVEL TARGET */}
            {item.level && (
              <div className="flex items-center gap-2 w-fit px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-purple-100">
                <GraduationCap size={12} />
                {item.level.name}
              </div>
            )}

            {/* TEACHER TARGET */}
            {item.teacher && (
              <div className="flex items-center gap-2 w-fit px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                <User size={12} />

                {item.teacher.firstName}{" "}
                {item.teacher.lastName}
              </div>
            )}

            {/* GLOBAL */}
            {!item.class &&
              !item.level &&
              !item.teacher && (
                <div className="flex items-center gap-2 w-fit px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">
                  <Globe size={12} />
                  Global
                </div>
              )}
          </div>
        </td>

        {/* ---------------------------------------------------- */}
        {/* DATE */}
        {/* ---------------------------------------------------- */}

        <td className="hidden lg:table-cell p-4 text-slate-500 font-bold tabular-nums">
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(new Date(item.publishedAt))}
        </td>

        {/* ---------------------------------------------------- */}
        {/* ACTIONS */}
        {/* ---------------------------------------------------- */}

        {role === "admin" && (
          <td className="p-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <FormContainer
                table="announcement"
                type="update"
                data={item}
                relatedData={relatedData}
              />

              <FormContainer
                table="announcement"
                type="delete"
                id={item.id}
              />
            </div>
          </td>
        )}
      </tr>
    );
  };

  // ============================================================
  // 11. MAIN PAGE
  // ============================================================

  return (
    <div className="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex-1 m-2 md:m-4 mt-0 shadow-sm border border-slate-100 min-h-[600px]">
      {/* ------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------ */}

      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        {/* TITLE */}
        <div className="flex items-center gap-4">
          {(role === "admin" || role === "teacher") && (
            <Link
              href="/list/announcements"
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft size={20} />
            </Link>
          )}

          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
              {levelId
                ? "Level Notices"
                : "Notice Registry"}
            </h1>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {role === "admin" && (
            <FormContainer
              table="announcement"
              type="create"
              relatedData={relatedData}
            />
          )}
        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* TABLE */}
      {/* ------------------------------------------------------ */}

      <div className="bg-white rounded-3xl border border-slate-50 overflow-hidden shadow-sm">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={data}
        />
      </div>

      {/* ------------------------------------------------------ */}
      {/* EMPTY STATE */}
      {/* ------------------------------------------------------ */}

      {!data.length && (
        <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2rem] mt-4">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
            No announcements found
          </p>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* PAGINATION */}
      {/* ------------------------------------------------------ */}

      <div className="mt-8 border-t border-slate-50 pt-6">
        <Pagination
          page={p}
          count={count}
        />
      </div>
    </div>
  );
};

export default AnnouncementListPage;