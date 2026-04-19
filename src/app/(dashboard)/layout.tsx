// src/app/(dashboard)/layout.tsx
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GraduationCap } from "lucide-react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  // 1. Fetch data in parallel for performance
  let user = null;
  let unreadMessageCount = 0;
  let filteredAnnouncementCount = 0;

  try {
    const [clerkUser, msgCount, announceCount] = await Promise.all([
      currentUser(),
      // Count messages for this specific user
      prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      }),
      // Count ONLY announcements this user is allowed to see
      prisma.announcement.count({
        where: {
          OR: [
            { classId: null }, // Global notices
            {
              class: {
                students: {
                  some: {
                    OR: [
                      { id: userId },      // If student
                      { parentId: userId } // If parent
                    ]
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    user = clerkUser;
    unreadMessageCount = msgCount;
    filteredAnnouncementCount = announceCount;
  } catch (err) {
    console.error("Layout Data Fetch Error:", err);
    if (!userId) redirect("/sign-in");
  }

  const firstName = user?.firstName || "User";

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* LEFT - SIDEBAR */}
      <div className="hidden md:block md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 border-r border-slate-100 overflow-y-auto custom-scrollbar">
        <Link href="/" className="flex items-center gap-1.5 mb-10 px-1 w-full justify-start overflow-hidden">
          <div className="flex-shrink-0 bg-blue-600 p-1 rounded-lg shadow-md flex items-center justify-center">
            <GraduationCap size={20} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="hidden lg:flex items-center">
            <span className="text-blue-600 font-black text-base uppercase tracking-tight">Rubix</span>
            <span className="text-slate-800 font-black text-base uppercase tracking-tight ml-1">School</span>
          </div>
        </Link>
        <Menu role={role} />
      </div>

      {/* RIGHT - MAIN CONTENT AREA */}
      <div className="flex-1 bg-[#F7F8FA] flex flex-col h-full overflow-hidden">
        <Navbar
          messageCount={unreadMessageCount}
          currentUserId={userId}
          role={role}
          firstName={firstName}
          announcementCount={filteredAnnouncementCount}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-[1600px] mx-auto pb-24 md:pb-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}