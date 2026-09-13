"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import {
  Home, Users, UserSquare2, UserCircle, BookOpen, GraduationCap,
  Book, FileText, ClipboardList, BarChart3, CheckCircle2,
  Calendar, MessageCircle, Megaphone, User, Settings, LogOut,
  CalendarDays,
  ClipboardListIcon,
  Banknote,
  Calculator,
  Bell,
  Receipt,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Layers,
  GitBranch
} from "lucide-react";

const getMenuItems = (role: string) => [
  {
    title: "MENU",
    items: [
      {
        icon: <Home size={20} />,
        label: "Home",
        href:
          role === "admin"
            ? "/admin"
            : role === "teacher"
              ? "/teacher"
              : role === "student"
                ? "/student"
                : "/parent",
        visible: ["admin", "teacher", "student", "parent"],
      },
      { icon: <ClipboardListIcon size={20} />, label: "Admissions", href: "/list/admissions", visible: ["admin"] },

      { icon: <Users size={20} />, label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: <UserSquare2 size={20} />, label: "Students", href: "/list/students", visible: ["admin", "teacher"] },

      { icon: <UserCircle size={20} />, label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: <Layers size={20} />, label: "Levels", href: "/list/levels", visible: ["admin", "teacher"] },

      { icon: <GitBranch size={20} />, label: "Streams", href: "/list/streams", visible: ["admin"] },


      { icon: <GraduationCap size={20} />, label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: <BookOpen size={20} />, label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: <Book size={20} />, label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },


      { icon: <ClipboardList size={20} />, label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <FileText size={20} />, label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <BarChart3 size={20} />, label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <CheckCircle2 size={20} />, label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },

      { icon: <Receipt size={20} />, label: "Receipts", href: "/parent/receipt", visible: ["parent"] },

      { icon: <Banknote size={20} />, label: "Finance Dashboard", href: "/admin/finance/balances", visible: ["admin"] },
      { icon: <Calculator size={20} />, label: "Allocate Fees", href: "/admin/finance/allocate", visible: ["admin"] },
      { icon: <Wallet size={20} />, label: "Fee categories", href: "/admin/finance/categories", visible: ["admin"] },

      { icon: <Wallet size={20} />, label: "Student Balance", href: "/admin/finance/balances", visible: ["admin"] },
      { icon: <CreditCard size={20} />, label: "Payment Record", href: "/admin/finance/payments", visible: ["admin"] },
      { icon: <TrendingUp size={20} />, label: "Income", href: "/list/income", visible: ["admin"] },
      { icon: <TrendingDown size={20} />, label: "Expense", href: "/list/expenses", visible: ["admin"] },
      { icon: <FileText size={20} />, label: "Financial Reports", href: "/admin/finance/reports", visible: ["admin"] },

      { icon: <MessageCircle size={20} />, label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Megaphone size={20} />, label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Bell size={20} />, label: "Notifications", href: "/list/notifications", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Calendar size={20} />, label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: <CalendarDays size={20} />, label: "Academic Sessions", href: "/admin/settings", visible: ["admin"] },
      { icon: <Settings size={20} />, label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <User size={20} />, label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <LogOut size={20} />, label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];

const Menu = ({ role, onClose }: { role: string; onClose?: () => void }) => {
  const menuItems = getMenuItems(role);

  return (
    <div className="flex flex-col justify-between h-full">
      {/* 1. TOP SECTION: NAV LINKS */}
      <div className="text-sm flex flex-col gap-4 px-3 py-5">
        {menuItems.map((container) => (
          <div className="flex flex-col gap-2" key={container.title}>
            <span className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              {container.title}
            </span>

            {container.items.map((item) => {
              if (item.visible.includes(role)) {
                if (item.label === "Logout") {
                  return (
                    <SignOutButton key={item.label} redirectUrl="/">
                      <button
                        onClick={onClose}
                        className="flex items-center gap-4 rounded-xl px-4 py-3 text-slate-700 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:shadow-blue-100 hover:-translate-y-[2px] active:scale-95 group"
                      >
                        <span className="text-slate-500 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="tracking-wide font-semibold whitespace-nowrap">
                          {item.label}
                        </span>
                      </button>
                    </SignOutButton>
                  );
                }

                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={onClose}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 text-slate-700 font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:shadow-blue-100 hover:-translate-y-[2px] active:scale-95 group"
                  >
                    <span className="text-slate-500 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="tracking-wide font-semibold whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* 2. BOTTOM SECTION: STREAMLINED FOOTER */}
      <div className="p-3 mt-auto border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-blue-200">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 tracking-wide">RUBIX</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">v2.0</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enterprise Online</span>
              </div>
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-400">
            © 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default Menu;