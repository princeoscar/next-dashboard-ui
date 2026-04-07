"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Home", href: "/", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/attendance.png", label: "Attendance", href: "/list/attendance", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/message.png", label: "Messages", href: "/list/messages", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  {
    title: "OTHER",
    items: [
      { icon: "/profile.png", label: "Profile", href: "/profile", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/setting.png", label: "Settings", href: "/settings", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/logout.png", label: "Logout", href: "/logout", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
];

const Menu = ({ role, isMobile = false }: { role: string; isMobile?: boolean }) => {
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


            const active = pathname === item.href;

            return (
              <Link
                href={item.href}
                key={item.label}
               className={`flex items-center gap-3 p-2 rounded-md transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >

                {/* ICON */}
                
                  <Image src={item.icon} alt="" width={18} height={18} />
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