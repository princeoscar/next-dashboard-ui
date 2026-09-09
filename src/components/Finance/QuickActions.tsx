import Link from "next/link";
import {
  Banknote,
  Bell,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";

const actions = [
  {
    title: "Allocate Fees",
    href: "/admin/finance/allocate",
    icon: Banknote,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Student Balances",
    href: "/admin/finance/balance",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Record Income",
    href: "/admin/finance/income",
    icon: DollarSign,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Record Expense",
    href: "/admin/finance/expense",
    icon: CreditCard,
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Fee Reminders",
    href: "#",
    icon: Bell,
    color: "bg-purple-100 text-purple-600",
  },
];

const QuickActions = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.title}
            href={action.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}
            >
              <Icon size={22} />
            </div>

            <h3 className="mt-4 font-semibold">
              {action.title}
            </h3>
          </Link>
        );
      })}
    </div>
  );
};

export default QuickActions;