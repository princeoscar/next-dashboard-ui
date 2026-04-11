"use client";

import Image from "next/image";

interface UserCardProps {
  type: "admin" | "teacher" | "student" | "parent";
  count: number; 
}

const UserCard = ({ type, count }: UserCardProps) => {
  
  const label = type === "admin" ? "Admins" : `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
  
  return (
    <div className="rounded-2xl odd:bg-rubixPurple even:bg-rubixYellow p-4 flex-1 min-w-[130px] shadow-sm hover:shadow-md transition-shadow duration-300">
      
      {/* TOP SECTION */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600 font-bold shadow-sm">
          2025/2026
        </span>
        <button className="hover:bg-black/5 rounded-full p-1 transition-colors">
          <Image src="/more.png" alt="more" width={20} height={20} />
        </button>
      </div>

      {/* DATA DISPLAY */}
      <h1 className="text-2xl font-bold my-4 text-slate-800">
        {count.toLocaleString()}
      </h1>
      
      {/* LABEL */}
      <h2 className="capitalize text-sm font-semibold text-gray-500 tracking-tight">
        {label}
      </h2>

    </div>
  );
};

export default UserCard;