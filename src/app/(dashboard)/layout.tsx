import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  // 1. Fetch Unread Messages
  // If this errors, ensure 'receiverId' in your schema is a String.
  const unreadMessages = await prisma.message.count({
    where: {
      receiverId: userId, 
      isRead: false,
    },
  });

  // 2. Fetch Recent Announcements
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activeAnnouncements = await prisma.announcement.count({
    where: {
      // NOTE: Ensure 'date' exists in your schema.prisma Announcement model.
      // If it fails, try 'createdAt' instead of 'date'.
      date: {
        gte: sevenDaysAgo,
      },
    },
  });

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:w-[16%] xl:w-[14%] p-4 flex-col border-r bg-white h-full">
        <Link href="/" className="flex items-center justify-start gap-2 mb-8 shrink-0">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
             <Image src="/logo.png" alt="logo" width={24} height={24} className="brightness-0 invert" />
          </div>
          <span className="font-bold text-slate-800 text-lg">Rubix Schools</span>
        </Link>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Menu role={role} />
        </div>

        <div className="mt-auto pt-4 shrink-0 border-t border-slate-50">
           <p className="text-[10px] text-gray-400 font-medium">SYSTEM v1.0.4</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#F7F8FA] flex flex-col h-full overflow-hidden">
        <Navbar 
          role={role}
          messageCount={unreadMessages} 
          announcementCount={activeAnnouncements}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}