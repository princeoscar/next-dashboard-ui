"use client";

import { useRouter, useSearchParams } from "next/navigation";

const ClassFilter = ({ classes }: { classes: { id: number; name: string }[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedClass = searchParams.get("classId");

  const handleFilter = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    if (id === "all") {
      params.delete("classId");
    } else {
      params.set("classId", id);
    }
    params.set("page", "1"); 
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
      <button
        onClick={() => handleFilter("all")}
        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
          !selectedClass ? "bg-rubixSky text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        All Classes
      </button>
      {classes.map((cls) => (
        <button
          key={cls.id}
          onClick={() => handleFilter(cls.id.toString())}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedClass === cls.id.toString()
              ? "bg-rubixSky text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {cls.name}
        </button>
      ))}
    </div>
  );
};

export default ClassFilter;