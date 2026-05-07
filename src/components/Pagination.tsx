"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`); //
  };

  // 🎯 Logic to only show current, neighbors, first, and last pages
  const renderPageButtons = () => {
    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => changePage(1)} className="px-2 rounded-sm hover:bg-slate-100">1</button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis-start">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`px-2 rounded-sm transition-colors ${page === i ? "bg-rubixSky text-white" : "hover:bg-slate-100"
            }`}
          onClick={() => changePage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="ellipsis-end">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => changePage(totalPages)} className="px-2 rounded-sm hover:bg-slate-100">
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>

      {/* 🎯 Added flex-wrap and justify-center to fix the "falling off" issue in Screenshot 2026-05-06 082942.png */}
      <div className="flex items-center gap-2 text-sm flex-wrap justify-center">
        {renderPageButtons()}
      </div>

      <button
        disabled={!hasNext}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;