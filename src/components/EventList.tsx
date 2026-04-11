
import { auth } from "@clerk/nextjs/server";

const EventList = ({ data }: { data: any[] }) => {
  // The empty state logic stays here because it's about UI
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