"use client";

import { BookOpen, GraduationCap } from "lucide-react";

// NOTE: We have removed FormContainer from imports to ensure no buttons can render
const SubjectSelector = ({ 
  subjects 
}: { 
  subjects: any[]
}) => {
  
  const grouped = subjects.reduce((acc, curr) => {
    const classes = curr.lessons?.map((l: any) => l.class.name) || [];
    
    if (classes.length === 0) {
      const groupName = "Unassigned Subjects";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(curr);
    } else {
      classes.forEach((className: string) => {
        const groupName = `Class ${className}`;
        if (!acc[groupName]) acc[groupName] = [];
        if (!acc[groupName].find((s: any) => s.id === curr.id)) {
          acc[groupName].push(curr);
        }
      });
    }
    return acc;
  }, {} as Record<string, any[]>);

  const sortedKeys = Object.keys(grouped).sort();

  return (
    <div className="space-y-12 pb-10">
      {sortedKeys.map((group) => (
        <div key={group} className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rubixPurple/10 text-rubixPurple rounded-xl">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              {group}
            </h3>
            <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {grouped[group].map((subject: any) => (
              <div 
                key={`${group}-${subject.id}`} 
                className="group relative bg-white border border-slate-100 p-6 rounded-[2.5rem] hover:border-rubixPurple hover:shadow-2xl hover:shadow-rubixPurple/10 transition-all duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-rubixPurple group-hover:text-white transition-all duration-500">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                    {subject.name}
                  </h4>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Teachers</p>
                  <div className="flex flex-wrap gap-1">
                    {subject.teachers?.map((t: any) => (
                      <span key={t.id} className="bg-slate-50 text-slate-600 text-[9px] font-bold px-2 py-1 rounded-md border border-slate-100">
                        {t.name} {t.surname?.[0]}.
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectSelector;