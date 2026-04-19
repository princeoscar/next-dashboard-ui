import { BellRing, CalendarDays } from "lucide-react";

interface AnnouncementProps {
  // Use a more specific type than 'any' if possible
  data?: {
    id: number | string;
    title: string;
    description: string;
    date: Date | string;
  }[];
  onSelect?: (announcement: any) => void;
}

const Announcements = ({ data = [] }: AnnouncementProps) => {
  const bgColors = [
    "bg-rubixSky/5 border-rubixSky/10",
    "bg-rubixPurple/5 border-rubixPurple/10",
    "bg-rubixYellow/5 border-rubixYellow/10",
  ];

  const textColors = ["text-rubixSky", "text-rubixPurple", "text-rubixYellow"];

  return (
    <div className="flex flex-col gap-4">
      {data.length > 0 ? (
        data.map((announcement, index) => {
          // Move logic outside the return for cleaner JSX
          const dateObj = announcement.date ? new Date(announcement.date) : null;
          const formattedDate = dateObj 
            ? new Intl.DateTimeFormat("en-GB", { day: '2-digit', month: 'short' }).format(dateObj)
            : "No Date";

          return (
            <div
              key={announcement.id}
              className={`${bgColors[index % 3]} border rounded-[2rem] p-5 transition-all hover:scale-[1.01] cursor-default group shadow-sm hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BellRing size={14} className={textColors[index % 3]} />
                  <h2 className="font-black text-sm text-slate-800 uppercase tracking-tight">
                    {announcement.title}
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-white/80 px-2 py-1 rounded-lg border border-white shadow-sm">
                  <CalendarDays size={10} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    {formattedDate}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                {announcement.description}
              </p>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
          <BellRing size={24} className="text-slate-200 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            No recent bulletins
          </p>
        </div>
      )}
    </div>
  );
};

export default Announcements;