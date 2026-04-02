import { User } from "@clerk/nextjs/server";
import Image from "next/image";

interface StudentSettingsProps {
  user: User | null;
}

const StudentSettings = ({ user }: StudentSettingsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={user?.imageUrl || "/noAvatar.png"}
            alt=""
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <h2 className="font-bold text-slate-800">{user?.fullName}</h2>
            <p className="text-xs text-gray-400">Student Portal Access</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Primary Email</span>
              <span className="text-sm text-slate-700">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
            <div className="flex flex-col p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Username</span>
              <span className="text-sm text-slate-700">@{user?.username || "student_user"}</span>
            </div>
          </div>
        </div>
        
        <button className="w-full mt-6 py-3 bg-slate-800 text-white font-bold rounded-xl text-sm hover:bg-slate-900 transition">
          Update Security Settings
        </button>
      </div>
    </div>
  );
};

export default StudentSettings;