import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { UserCircle, Mail, Hash, ShieldCheck, BookOpen, GraduationCap } from "lucide-react";

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    let dbUser: any = null;
    const currentRole = role?.toLowerCase();

    // Fetching with specific relations based on role
    if (currentRole === "admin") {
      dbUser = await prisma.user.findUnique({ where: { id: userId } });
    } 
    
    else if (currentRole === "teacher") {
      // Use the User model to get the base info + the Teacher professional info
      const userWithTeacher = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          teacher: {
            include: {
              subjects: true,
              classes: true,
            },
          },
        },
      });

      if (userWithTeacher) {
        dbUser = {
          ...userWithTeacher,
          // Flattening the data so the rest of your JSX doesn't need to change
          subjects: userWithTeacher.teacher?.subjects || [],
          classes: userWithTeacher.teacher?.classes || [],
        };
      }
    } 
    
    else if (currentRole === "student") {
      const userWithStudent = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          student: {
            include: {
              class: true,
              grade: true,
            },
          },
        },
      });

      if (userWithStudent) {
        dbUser = {
          ...userWithStudent,
          // Flattening for the JSX
          class: userWithStudent.student?.class || null,
          grade: userWithStudent.student?.grade || null,
        };
      }
    }
    if (!dbUser) {
      return (
        <div className="p-8 text-center text-slate-500 italic">
          Account synchronization in progress. Please check back in a moment.
        </div>
      );
    }

    return (
      <div className="p-6 flex flex-col gap-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <UserCircle size={120} />
          </div>

          <div className="relative w-32 h-32">
            <Image
              src={dbUser.img || "/noAvatar.png"}
              alt="User Profile"
              fill
              className="rounded-3xl object-cover border-4 border-slate-50 shadow-inner"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {dbUser.name || "User"}
              </h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {role}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-blue-400" />
                {dbUser.email || "No email provided"}
              </div>
              <div className="flex items-center gap-1.5">
                <Hash size={14} className="text-purple-400" />
                {dbUser.username}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* GENERAL INFO SECTION */}
          <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-400" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">System Records</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Database ID</span>
                <span className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-100">{dbUser.id.slice(-12)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Phone</span>
                <span className="text-sm font-semibold text-slate-700">{dbUser.phone || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Blood Type</span>
                <span className="text-sm font-semibold text-slate-700">{dbUser.bloodType || "—"}</span>
              </div>
            </div>
          </div>

          {/* ROLE-SPECIFIC INFO SECTION */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <ActivityIcon role={role} />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Assignments</h3>
            </div>

            {role === "teacher" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {dbUser.subjects?.map((s: any) => (
                    <span key={s.id} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-indigo-100 italic">
                      # {s.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">Managing {dbUser.classes?.length || 0} Classrooms</p>
              </div>
            )}

            {role === "student" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Current Grade</p>
                    <p className="text-lg font-black text-orange-700">Grade {dbUser.grade?.level || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Home Class</p>
                    <p className="text-lg font-black text-blue-700">{dbUser.class?.name || "Unassigned"}</p>
                  </div>
                </div>
              </div>
            )}

            {role === "admin" && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-2">
                   <ShieldCheck size={32} />
                </div>
                <p className="text-sm font-bold text-slate-800">Master Administrative Privileges</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Full System Governance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return <div className="p-8 text-rose-500 font-bold">Terminal Error: System failed to retrieve local user records.</div>;
  }
};

// Helper Icon for sections
const ActivityIcon = ({ role }: { role?: string }) => {
  if (role === "teacher") return <BookOpen size={18} className="text-slate-400" />;
  if (role === "student") return <GraduationCap size={18} className="text-slate-400" />;
  return <ShieldCheck size={18} className="text-slate-400" />;
};

export default ProfilePage;