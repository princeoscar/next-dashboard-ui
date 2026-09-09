"use client";

import * as XLSX from "xlsx";

type Props = {
  rows: any[];
};

const ExportExcel = ({ rows }: Props) => {
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Financial Report"
    );

    XLSX.writeFile(
      workbook,
      "Financial_Report.xlsx"
    );
  };

  return (
    <button
      onClick={exportExcel}
      className="
      rounded-xl
      bg-green-600
      px-4
      py-2
      text-white
      font-semibold
      hover:bg-green-700
      transition
      "
    >
      📊 Export Excel
    </button>
  );
};

export default ExportExcel;