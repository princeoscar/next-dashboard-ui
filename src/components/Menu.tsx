import Link from "next/link";
import { 
  Home, 
  Users, 
  UserSquare2, 
  UserCircle, 
  BookOpen, 
  GraduationCap, 
  Book, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  CheckCircle2, 
  Calendar, 
  MessageCircle, 
  Megaphone, 
  User, 
  Settings, 
  LogOut 
} from "lucide-react";

// 1. Define your menu structure with Lucide components
const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: <Home size={20} />,
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <Users size={20} />,
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: <UserSquare2 size={20} />,
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: <UserCircle size={20} />,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: <BookOpen size={20} />,
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: <GraduationCap size={20} />,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: <Book size={20} />,
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: <FileText size={20} />,
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <ClipboardList size={20} />,
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <BarChart3 size={20} />,
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <CheckCircle2 size={20} />,
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <Calendar size={20} />,
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <MessageCircle size={20} />,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <Megaphone size={20} />,
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: <User size={20} />,
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <Settings size={20} />,
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: <LogOut size={20} />,
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

// 2. Add 'onClose' to the component props
const Menu = ({ role, onClose }: { role: string; onClose?: () => void }) => {
  return (
    <div className="mt-4 text-sm flex flex-col gap-2">
      {menuItems.map((container) => (
        <div className="flex flex-col gap-2" key={container.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4 uppercase tracking-wider text-[10px]">
            {container.title}
          </span>
          {container.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  onClick={onClose} // 🚀 THIS CLOSES THE MENU ON CLICK
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-slate-100 transition-all"
                >
                  <span className="text-slate-600">{item.icon}</span>
                  {/* On Mobile, we always show the label. On Desktop, only on Large screens */}
                  <span className="text-slate-700 font-medium lg:block">
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
  );
};

export default Menu;