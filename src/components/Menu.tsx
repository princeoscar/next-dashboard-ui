"use client"; 

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs"; 
import { 
  Home, Users, UserSquare2, UserCircle, BookOpen, GraduationCap, 
  Book, FileText, ClipboardList, BarChart3, CheckCircle2, 
  Calendar, MessageCircle, Megaphone, User, Settings, LogOut, 
  CalendarDays
} from "lucide-react";

const getMenuItems = (role: string) => [
  {
    title: "MENU",
    items: [
      { icon: <Home size={20} />, label: "Home", href: "/", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <Users size={20} />, label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: <UserSquare2 size={20} />, label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: <UserCircle size={20} />, label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: <BookOpen size={20} />, label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: <GraduationCap size={20} />, label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: <Book size={20} />, label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: <FileText size={20} />, label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <ClipboardList size={20} />, label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <BarChart3 size={20} />, label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: <CheckCircle2 size={20} />, label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
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
      <div className="text-sm flex flex-col gap-2 p-4">
        {menuItems.map((container) => (
          <div className="flex flex-col gap-2" key={container.title}>
            <span className="text-gray-400 font-semibold my-3 uppercase tracking-wider text-[11px] px-2">
              {container.title}
            </span>

            {container.items.map((item) => {
              if (item.visible.includes(role)) {
                if (item.label === "Logout") {
                  return (
                    <SignOutButton key={item.label} redirectUrl="/">
                      <button
                        onClick={onClose}
                        className="flex items-center justify-start gap-3 text-slate-700 py-2 px-3 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 active:scale-95 group w-full text-left"
                      >
                        <span className="text-slate-500 group-hover:text-rose-500 transition-colors">
                          {item.icon}
                        </span>
                        <span className="lg:block font-semibold">{item.label}</span>
                      </button>
                    </SignOutButton>
                  );
                }

                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={onClose}
                    className="flex items-center justify-start gap-3 text-slate-700 py-2 px-3 rounded-lg hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-200 active:scale-95 group"
                  >
                    <span className="text-slate-500 group-hover:text-blue-500 transition-colors">
                      {item.icon}
                    </span>
                    <span className="lg:block font-semibold">{item.label}</span>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* 2. BOTTOM SECTION: VERSION FOOTER */}
      <div className="p-4 mt-auto">
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            System Version
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-bold text-slate-600">v1.0.4-stable</p>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">
            © RubixTech 2026 Dashboard UI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;