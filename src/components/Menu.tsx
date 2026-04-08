"use client";

import { BookOpen, Calendar, ClipboardList, FileText, GraduationCap, Home, Icon, LogOut, Megaphone, MessageSquare, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: Home, label: "Home", href: "/", visible: ["admin", "teacher", "student", "parent"] },
      { icon: User, label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: User, label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: User, label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: BookOpen, label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: ClipboardList, label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: ClipboardList, label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: GraduationCap, label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: FileText, label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: FileText, label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: Calendar, label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
      { icon: Calendar, label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
      { icon: MessageSquare, label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
      { icon: Megaphone, label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: User, label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: Settings, label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: LogOut, label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];

const Menu = ({ role,
   isMobile = false,
   onClose,
  }: { 
    role: string;
     isMobile?: boolean;
     onClose?: () => void;
    }) => {
  const pathname = usePathname();


  return (
    <div className="text-sm">
      {menuItems.map((section) => (
        <div key={section.title} className="mb-4">

          {/* SECTION TITLE */}
          <p className={`${isMobile ? "block" : "hidden lg:block"} text-gray-400 text-xs mb-2`}>
            {section.title}
          </p>


          {/* MENU ITEMS */}
          {section.items.map((item) => {
            if (!item.visible.includes(role)) return null;

             const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center gap-3 p-2 rounded-md transition ${active
                  ? "bg-indigo-50 text-indigo-600 font-semibold"
                  : "text-gray-500 hover:bg-gray-100"
                  }`}
              >

                <Icon size={18} />
                <span className={isMobile ? "block" : "hidden lg:block"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;