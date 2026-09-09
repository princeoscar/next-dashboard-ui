
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  GraduationCap,
  Calendar as CalendarIcon,
} from "lucide-react";

const StudentPage = async () => {
  // ------------------------------------------------------------
  // GET LOGGED-IN USER
  // ------------------------------------------------------------

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // ------------------------------------------------------------
  // FIND THE STUDENT
  // ------------------------------------------------------------

  const student = await prisma.student.findUnique({
    where: {
      clerkId: userId,
    },
    select: {
      id: true,
      classId: true,
      levelId: true,
      schoolId: true,
    },
  });

  // ------------------------------------------------------------
  // STUDENT NOT FOUND
  // ------------------------------------------------------------

  if (!student) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <div className="bg-rubixSky/10 p-6 rounded-3xl mb-6 text-rubixSky">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            Student Profile Not Found
          </h1>

          <p className="text-xs md:text-sm text-slate-500 mt-3 max-w-sm font-medium">
            Your student account could not be found.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // STUDENT HAS NO CLASS
  // ------------------------------------------------------------

  if (!student.classId) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
          <div className="bg-rubixSky/10 p-6 rounded-3xl mb-6 text-rubixSky">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase">
            No Class Assigned
          </h1>

          <p className="text-xs md:text-sm text-slate-500 mt-3 max-w-sm font-medium">
            Please contact the School Administrator to get your class assigned.
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // FETCH CLASS AND ANNOUNCEMENTS
  // ------------------------------------------------------------

  const [classItem, announcements] = await Promise.all([
    // Get student's class
    prisma.class.findUnique({
      where: {
        id: student.classId,
      },
    }),

    // Get announcements relevant to this student
    prisma.announcement.findMany({
      where: {
        schoolId: student.schoolId,

        OR: [
          // ----------------------------------------------------
          // GLOBAL ANNOUNCEMENTS
          // ----------------------------------------------------
          {
            classId: null,
            levelId: null,
            teacherId: null,
          },

          // ----------------------------------------------------
          // ANNOUNCEMENTS FOR STUDENT'S CLASS
          // ----------------------------------------------------
          {
            classId: student.classId,
          },

          // ----------------------------------------------------
          // ANNOUNCEMENTS FOR STUDENT'S LEVEL
          // ----------------------------------------------------
          {
            levelId: student.levelId,
          },
        ],
      },

      orderBy: {
        publishedAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        title: true,
        description: true,
        publishedAt: true,
      },
    }),
  ]);

  // ------------------------------------------------------------
  // CLASS NOT FOUND
  // ------------------------------------------------------------

  if (!classItem) {
    return null;
  }

  // ------------------------------------------------------------
  // PAGE
  // ------------------------------------------------------------

  return (
    <div className="p-4 md:p-8 flex gap-6 md:gap-8 flex-col xl:flex-row bg-slate-50/50 min-h-screen">

      {/* ====================================================== */}
      {/* LEFT SIDE */}
      {/* ====================================================== */}

      <div className="w-full xl:w-2/3 flex flex-col gap-6 md:gap-8">

        {/* WEEKLY SCHEDULE */}

        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">

          <div className="absolute top-[-5%] right-[-5%] w-32 h-32 bg-rubixSky/5 rounded-full blur-3xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4 relative z-10">

            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1">

                <div className="w-1.5 h-6 md:w-2 md:h-8 bg-rubixSky rounded-full" />

                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase">
                  Weekly Schedule
                </h1>

              </div>

              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-4 md:ml-5">
                Current Roster:

                <span className="text-rubixSky ml-1">
                  {classItem.name}
                </span>
              </p>
            </div>

            <div className="self-start md:self-center bg-slate-900 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] shadow-lg flex items-center gap-2">

              <CalendarIcon
                size={12}
                className="text-rubixSky"
              />

              Academic Term 2025/26

            </div>

          </div>

          <div className="h-[500px] sm:h-[600px] xl:h-[750px] bg-slate-50/30 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 p-2 md:p-4">

            <BigCalendarContainer
              type="classId"
              id={classItem.id}
            />

          </div>

        </div>

      </div>

      {/* ====================================================== */}
      {/* RIGHT SIDE */}
      {/* ====================================================== */}

      <div className="w-full xl:w-1/3 flex flex-col gap-6 md:gap-8">

        {/* ==================================================== */}
        {/* SCHOOL EVENTS */}
        {/* ==================================================== */}

        <div className="bg-white p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-1.5 h-4 md:h-5 bg-rubixYellow rounded-full" />

            <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">
              School Events
            </h2>

          </div>

          <EventCalendar />

        </div>

        {/* ==================================================== */}
        {/* ANNOUNCEMENTS */}
        {/* ==================================================== */}

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">

          <div className="flex items-center gap-3 mb-6 md:mb-8">

            <div className="w-1.5 h-4 md:h-5 bg-rubixPurple rounded-full" />

            <h2 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-widest">
              Bulletins
            </h2>

          </div>

          <Announcements data={announcements} />

        </div>

      </div>

    </div>
  );
};

export default StudentPage;