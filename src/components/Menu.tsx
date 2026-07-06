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
  Bell
} from "lucide-react";

const getMenuItems = (role: string) => [
  {
    title: "MENU",
    items: [
      { icon: <Home size={20} />, label: "Home", href: "/", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <ClipboardListIcon size={20} />, label: "Admissions", href: "/list/admissions", visible: ["admin"] },
      { icon: <Banknote size={20} />, label: "Finance Tracking", href: "/admin/finance/balances", visible: ["admin"], },
      {
      icon: <Calculator size={20} />, // Or Lucide icon
      label: "Allocate Fees",
      href: "/admin/finance/allocate", // The new page we built
      visible: ["admin"],
    },
      { icon: <Users size={20} />, label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: <UserSquare2 size={20} />, label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      
      { icon: <UserCircle size={20} />, label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: <GraduationCap size={20} />, label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: <BookOpen size={20} />, label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: <Book size={20} />, label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: <FileText size={20} />, label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <ClipboardList size={20} />, label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <BarChart3 size={20} />, label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <CheckCircle2 size={20} />, label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Bell size={20} />, label: "Notifications", href: "/list/notifications", visible: ["admin", "teacher", "student", "parent"] },

      { icon: <Calendar size={20} />, label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <MessageCircle size={20} />, label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Megaphone size={20} />, label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
      


    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: <User size={20} />, label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Settings size={20} />, label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <LogOut size={20} />, label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <CalendarDays size={20} />, label: "Academic Sessions", href: "/admin/settings", visible: ["admin"] },
    ],
  },
];

const Menu = ({ role, onClose }: { role: string; onClose?: () => void }) => {
  const menuItems = getMenuItems(role);

  return (
    <div className="flex flex-col justify-between h-full min-h-[calc(100vh-40px)]">
      {/* 1. TOP SECTION: NAV LINKS */}
      <div
className="
text-sm
flex
flex-col
gap-4
px-3
py-5
overflow-y-auto
"
>
        {menuItems.map((container) => (
          <div className="flex flex-col gap-2" key={container.title}>
            <span
className="
px-4
mb-2
text-[10px]
font-black
uppercase
tracking-[0.25em]
text-slate-400
"
>
              {container.title}
            </span>

            {container.items.map((item) => {
              if (item.visible.includes(role)) {
                if (item.label === "Logout") {
                  return (
                    <SignOutButton key={item.label} redirectUrl="/">
                      <button
                        onClick={onClose}
                        className="
flex items-center
gap-4
rounded-xl
px-4
py-3
text-slate-700
font-medium
transition-all
duration-300
hover:bg-gradient-to-r
hover:from-blue-50
hover:to-indigo-50
hover:text-blue-700
hover:shadow-md
hover:shadow-blue-100
hover:-translate-y-[2px]
active:scale-95
group
"
                      >
                        <span
className="
text-slate-500
group-hover:text-blue-600
transition-all
duration-300
group-hover:scale-110
"
>
                          {item.icon}
                        </span>
                        <span
className="
hidden
lg:block
tracking-wide
font-semibold
"
>{item.label}</span>
                      </button>
                    </SignOutButton>
                  );
                }

                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={onClose}
                    className="
flex items-center
gap-4
rounded-xl
px-4
py-3
text-slate-700
font-medium
transition-all
duration-300
hover:bg-gradient-to-r
hover:from-blue-50
hover:to-indigo-50
hover:text-blue-700
hover:shadow-md
hover:shadow-blue-100
hover:-translate-y-[2px]
active:scale-95
group
"
                  >
                    <span
                      className="
text-slate-500
group-hover:text-blue-600
transition-all
duration-300
group-hover:scale-110
"
                    >
                      {item.icon}
                    </span>
                    <span
className="
hidden
lg:block
tracking-wide
font-semibold
"
>{item.label}</span>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* 2. BOTTOM SECTION: VERSION FOOTER */}
      {/* Premium Footer */}
      <div className="p-4 mt-auto">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">

          <div className="p-5">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black">
                R
              </div>

              <div>
                <h3 className="font-extrabold tracking-wide">
                  RUBIX
                </h3>

                <p className="text-xs text-blue-200">
                  School ERP
                </p>
              </div>

            </div>

            <div className="mt-5 border-t border-white/10 pt-4">

              <div className="flex justify-between">

                <span className="text-xs text-slate-300">
                  Enterprise
                </span>

                <span className="font-bold text-green-400">
                  v2.0
                </span>

              </div>

              <div className="flex justify-between mt-2">

                <span className="text-xs text-slate-300">
                  Status
                </span>

                <span className="flex items-center gap-2 text-green-400 text-xs font-bold">

                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>

                  Online

                </span>

              </div>

            </div>

          </div>

          <div className="bg-black/20 px-5 py-3 text-center text-[10px] text-slate-300">
            © 2026 Rubix Technologies
          </div>

        </div>
      </div>
    </div>
  );
};

export default Menu;