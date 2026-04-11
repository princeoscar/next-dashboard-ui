import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server"; // Import Clerk
import { prisma } from "@/lib/prisma"; // Import Prisma

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. FETCH THE DATA HERE
  const { userId } = await auth();
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) || "user";
  const firstName = user?.firstName || "Guest";
  const announcementCount = await prisma.announcement.count();

  return (
    <div className="h-screen flex overflow-hidden"> 
      
      {/* LEFT - SIDEBAR */}
      <div className="hidden md:block md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 border-r border-gray-100 overflow-y-auto custom-scrollbar">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2 mb-4"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold text-slate-800">Rubix School</span>
        </Link>
        <Menu role={role}/>
      </div>

      {/* RIGHT - MAIN CONTENT */}
      <div className="w-full md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] flex flex-col h-full overflow-y-auto">
        {/* 2. PASS THE DEFINED VARIABLES */}
        <Navbar 
          role={role} 
          firstName={firstName} 
          announcementCount={announcementCount}
        />
        <div className="p-4">
           {children}
        </div>
      </div>
    </div>
  );
}