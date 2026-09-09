import FinanceChart from "@/components/FinanceChart";
import FinanceCards from "@/components/Finance/FinanceCards";
import QuickActions from "@/components/Finance/QuickActions";
import RecentPayments from "@/components/Finance/RecentPayments";

import { getFinanceDashboard } from "@/lib/dashboard/finance";
import { getRecentPayments } from "@/lib/actions/finance";

const FinancePage = async () => {
  const dashboard = await getFinanceDashboard();
  const recentPayments = await getRecentPayments();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Finance Dashboard
        </h1>

        <p className="text-sm text-gray-500">
          Monitor school finances, payments, income and expenses.
        </p>
      </div>

      {/* Summary Cards */}
      <FinanceCards
        expectedFees={dashboard.expectedFees}
        totalPaid={dashboard.totalPaid}
        outstanding={dashboard.outstanding}
        totalDiscount={dashboard.totalDiscount}
        totalRevenue={dashboard.totalRevenue}
        netIncome={dashboard.netIncome}
        paymentsToday={dashboard.paymentsToday}
        debtors={dashboard.debtors}
      />

      {/* Finance Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <FinanceChart />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Payments */}
      <RecentPayments />
    </div>
  );
};

export default FinancePage;