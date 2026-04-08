"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  // Logic to determine if buttons should be enabled
  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  const changePage = (newPage: number) => {
    // We use URLSearchParams to keep existing search/filter queries while changing 'page'
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="p-4 flex items-center justify-between text-slate-500">
      {/* PREVIOUS BUTTON */}
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-100 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>

      {/* PAGE NUMBERS */}
      <div className="flex items-center gap-2">
        {Array.from(
          { length: Math.ceil(count / ITEM_PER_PAGE) },
          (_, index) => {
            const pageIndex = index + 1;
            return (
              <button
                key={pageIndex}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all border ${
                  page === pageIndex
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                    : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
                }`}
                onClick={() => changePage(pageIndex)}
              >
                {pageIndex}
              </button>
            );
          }
        )}
      </div>

      {/* NEXT BUTTON */}
      <button
        disabled={!hasNext}
        className="py-2 px-4 rounded-md bg-slate-100 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;