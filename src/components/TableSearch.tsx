"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const TableSearch = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);

    // CORRECTION 1: If value is empty, remove the search param entirely
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    // CORRECTION 2: Always reset to page 1 when a new search is performed
    // This prevents "blank screens" if you were previously on a high page number.
    params.delete("page");

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-4 py-1 hover:ring-indigo-400 transition-all bg-white"
    >
      <Image src="/search.png" alt="search" width={14} height={14} />
      <input
        type="text"
        placeholder="Search..."
        className="w-[200px] p-2 bg-transparent outline-none text-slate-600 font-medium"
      />
      {/* Tip: Adding a hidden submit button ensures 'Enter' always works */}
      <button type="submit" className="hidden">Search</button>
    </form>
  );
};

export default TableSearch;