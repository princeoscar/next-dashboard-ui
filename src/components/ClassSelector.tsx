"use client";

import Link from "next/link";
import { LayoutGrid, ArrowRight, GraduationCap } from "lucide-react";
import FormContainer from "@/components/FormContainer";

const ClassSelector = ({
  classes,
  role,
  target,
  relatedData
}: {
  classes: any[],
  role: string,
  target: string,
  relatedData: any
}) => {

  const grouped = classes.reduce((acc, curr) => {
    const level = curr.grade.level;
    let gradeName = "";
    if (level >= 7 && level <= 9) gradeName = `Junior Secondary (JSS ${level - 6})`;
    else if (level >= 10) gradeName = `Senior Secondary (SS ${level - 9})`;
    else gradeName = `Primary (Grade ${level})`;

    if (!acc[gradeName]) acc[gradeName] = [];
    acc[gradeName].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8 pb-10">
      {Object.keys(grouped).map((grade) => (
        <div key={grade} className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-lg">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              {grade}
            </h3>
            <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {grouped[grade].map((cls: any) => (
              <div
                key={cls.id}
                className="group relative bg-white border border-slate-100 p-5 rounded-3xl hover:border-rubixPurple hover:shadow-xl hover:shadow-rubixPurple/5 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[140px]"
              >
                {/* ADMIN ACTIONS: Only show if admin and NOT in student view (where we want it clean) */}
                {role === "admin" && target !== "students" && (
                  <div 
                    className="absolute top-3 right-3 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FormContainer
                      table="class"
                      type="update"
                      data={cls}
                      relatedData={relatedData}
                    />
                    <FormContainer table="class" type="delete" id={cls.id} />
                  </div>
                )}

                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 group-hover:text-rubixPurple transition-colors">
                    {cls.supervisor
                      ? `${cls.supervisor.name} ${cls.supervisor.surname}`
                      : `Section ${cls.name.slice(-1)}`}
                  </p>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">
                    Class {cls.name}
                  </h4>

                  {/* 🚀 FIXED DYNAMIC COUNT LABEL (Removed the duplicate block) */}
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">
                    {target === "exams"
                      ? `Assessments: ${cls._count?.lessons || 0} Exams`
                      : target === "lessons"
                        ? `Schedule: ${cls._count?.lessons || 0} Lessons`
                        : target === "subjects"
                          ? `Curriculum: ${cls._count?.lessons || 0} Subjects`
                          : `Enrolled: ${cls._count?.students || 0} Students`}
                  </p>
                </div>

                <Link
                  href={`/list/${target}?classId=${cls.id}`}
                  className="relative z-10 mt-4 flex items-center justify-between bg-slate-50 group-hover:bg-rubixPurple p-3 rounded-2xl transition-all"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                    View {target}
                  </span>
                  <div className="text-slate-300 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </Link>

                <LayoutGrid className="absolute -bottom-2 -right-2 text-slate-50 w-16 h-16 -rotate-12 group-hover:text-rubixPurple/5 transition-colors z-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassSelector;