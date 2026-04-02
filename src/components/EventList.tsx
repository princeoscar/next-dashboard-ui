import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 1. Precise Date Logic
  const date = dateParam ? new Date(dateParam) : new Date();
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 2. Fetch with Role-Based Access Control (RBAC)
  const data = await prisma.event.findMany({
  where: {
    startTime: {
      gte: startOfDay,
      lte: endOfDay,
    },
    // The fix is ensuring the OR array objects are valid Event filters
    ...(role !== "admin" && {
      OR: [
        { classId: null }, // General events
        {
          class: {
            OR: [
              { supervisorId: userId! },
              { students: { some: { id: userId! } } },
              { students: { some: { parentId: userId! } } },
            ],
          },
        },
      ],
    }),
  },
  orderBy: { startTime: "asc" },
});

  // 3. High-Quality Empty State
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-xl">
        <p className="text-slate-400 text-sm font-medium italic">No events scheduled for this day.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((event) => (
        <div
          className="p-5 rounded-2xl bg-white border-l-4 odd:border-l-rubixSky even:border-l-rubixPurple shadow-sm hover:shadow-md transition-all border border-slate-100 group"
          key={event.id}
        >
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-bold text-sm text-slate-700 group-hover:text-rubixSky transition-colors">
              {event.title}
            </h1>
            <span className="text-slate-400 text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-lg shrink-0">
              {event.startTime.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
          <p className="mt-2 text-slate-500 text-xs leading-relaxed line-clamp-2">
            {event.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default EventList;