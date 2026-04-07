import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

// ✅ DYNAMIC IMPORTS: These must be outside the function scope.
// This tells Next.js to ignore these on the server-side render (SSR).


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  // Fetching data safely
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const [unreadMessages, activeAnnouncements] = await Promise.all([
    prisma.message.count({
      where: { receiverId: userId, isRead: false },
    }),
    prisma.announcement.count({
      where: { date: { gte: lastWeek } },
    }),
  ]);

  return (
    <div className="h-screen flex overflow-hidden">
      <aside className="hidden lg:flex lg:w-[16%] xl:w-[14%] p-4 flex-col border-r bg-white h-full">
        <Link href="/" className="flex items-center gap-2 mb-8 shrink-0">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Image src="/logo.png" alt="logo" width={24} height={24} className="brightness-0 invert" />
          </div>
          <span className="font-bold text-slate-800 text-lg">Rubix Schools</span>
        </Link>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <Menu role={role} />
        </div>
      </aside>

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