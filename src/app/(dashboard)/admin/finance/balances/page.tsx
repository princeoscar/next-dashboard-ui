// src/app/dashboard/admin/finance/balances/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface AdminBalancesPageProps {
  searchParams: {
    status?: "FULLY_PAID" | "PARTIAL" | "UNPAID";
  };
}

export default async function AdminOutstandingBalancesReport({ searchParams }: AdminBalancesPageProps) {
  const currentTab = searchParams.status || "UNPAID";

  // 1. Fetch ledger accounts and include the nested Student and Class/Level relationships
  const studentLedger = await prisma.studentBalance.findMany({
    where: {
      status: currentTab
    },
    include: {
      allocation: {
        include: { category: true }
      }
    },
    orderBy: {
      outstanding: "desc"
    }
  });

  const summaryAggregations = await prisma.studentBalance.aggregate({
    _sum: {
      totalAssigned: true,
      paidAmount: true,
      outstanding: true,
    }
  });

  const grossAssigned = Number(summaryAggregations._sum.totalAssigned || 0);
  const grossCollected = Number(summaryAggregations._sum.paidAmount || 0);
  const grossOutstanding = Number(summaryAggregations._sum.outstanding || 0);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Collections Control Panel</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track collections, filter payment stages, and manage unpaid student accounts.</p>
      </div>

      {/* Aggregate Overview Matrix Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Gross Invoiced Revenue</span>
          <h3 className="text-xl font-black text-gray-900 mt-1">₦{grossAssigned.toLocaleString()}</h3>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm border-l-green-500 border-l-4">
          <span className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Total Revenue Collected</span>
          <h3 className="text-xl font-black text-green-600 mt-1">₦{grossCollected.toLocaleString()}</h3>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm border-l-red-500 border-l-4">
          <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider">Gross Outstanding Arrears</span>
          <h3 className="text-xl font-black text-red-600 mt-1">₦{grossOutstanding.toLocaleString()}</h3>
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="flex border-b border-gray-200 text-xs font-semibold space-x-6">
        <Link
          href="/admin/finance/balances?status=UNPAID"
          className={`pb-3 transition-all ${currentTab === "UNPAID" ? "border-b-2 border-red-600 text-red-600 font-bold" : "text-gray-400 hover:text-gray-600"}`}
        >
          Yet to Pay (Unpaid)
        </Link>
        <Link
          href="/admin/finance/balances?status=PARTIAL"
          className={`pb-3 transition-all ${currentTab === "PARTIAL" ? "border-b-2 border-amber-500 text-amber-600 font-bold" : "text-gray-400 hover:text-gray-600"}`}
        >
          Yet to Balance (Partial)
        </Link>
        <Link
          href="/admin/finance/balances?status=FULLY_PAID"
          className={`pb-3 transition-all ${currentTab === "FULLY_PAID" ? "border-b-2 border-green-600 text-green-600 font-bold" : "text-gray-400 hover:text-gray-600"}`}
        >
          Fully Paid
        </Link>
      </div>

      {/* Main Student Data Ledger Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Student Info</th>
                <th className="p-4">Assigned Class</th>
                <th className="p-4">Fee Breakdown</th>
                <th className="p-4">Total Invoice</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Outstanding Due</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-600 font-medium">
              {studentLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-gray-400">
                    No student accounts match this payment status filter category.
                  </td>
                </tr>
              ) : (
                studentLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {/* Fallback to just the ID if we can't fetch the name yet */}
                        Student: {row.studentId}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      {/* If you don't have the relation yet, we can't show class name here */}
                      Pending Class Mapping
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      {row.student?.class?.name || "Class Sandbox Room 1"}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{row.allocation.category.name}</div>
                      <div className="text-[10px] text-gray-400">{row.allocation.term} Term • {row.allocation.academicYear}</div>
                    </td>
                    <td className="p-4">₦{Number(row.totalAssigned).toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-medium">₦{Number(row.paidAmount).toLocaleString()}</td>
                    <td className="p-4 text-red-600 font-bold">₦{Number(row.outstanding).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${row.status === "FULLY_PAID" ? "bg-green-50 text-green-700 border border-green-200" :
                          row.status === "PARTIAL" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}