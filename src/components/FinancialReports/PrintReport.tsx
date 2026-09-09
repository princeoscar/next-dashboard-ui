"use client";

const PrintReport = () => {
  return (
    <button
      onClick={() => window.print()}
      className="
      rounded-xl
      border
      px-4
      py-2
      font-semibold
      hover:bg-gray-100
      transition
      "
    >
      🖨 Print
    </button>
  );
};

export default PrintReport;