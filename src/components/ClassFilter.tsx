"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ClassFilterProps = {
  classes: {
    id: number;
    name: string;
  }[];
};

const ClassFilter = ({ classes }: ClassFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentClassId = searchParams.get("classId") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());

    // Reset pagination whenever filter changes
    params.delete("page");

    if (value) {
      params.set("classId", value);
    } else {
      params.delete("classId");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={currentClassId}
        onChange={handleChange}
        className="
          appearance-none
          min-w-[190px]
          bg-white
          border border-slate-200
          rounded-xl
          px-4
          py-2.5
          pr-10
          text-sm
          font-medium
          text-slate-700
          outline-none
          cursor-pointer
          transition-all
          focus:border-blue-400
          focus:ring-2
          focus:ring-blue-100
        "
      >
        <option value="">All Classes</option>

        {classes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {/* Dropdown arrow */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        ▼
      </div>
    </div>
  );
};

export default ClassFilter;