"use client";

import React from 'react';
import { FileCheck, Award, Calendar, User, Hash, CheckCircle } from 'lucide-react';

interface SubjectResult {
  name: string;
  ca: number;
  exam: number;
  total: string;
  level: string;
}

interface ReportCardProps {
  data: {
    studentName: string;
    studentId: string;
    className: string;
    subjects: SubjectResult[];
    academicYear: string;
    position?: string;
    principalComment?: string;
    attendance?: {
      present: number;
      total: number;
    };
  };
}

const ReportCardSheet = ({ data }: ReportCardProps) => {
  if (!data || !data.subjects) return <div className="p-10 text-red-500 font-bold text-center uppercase tracking-widest border-2 border-dashed border-red-200 rounded-3xl">Critical Error: Student Data Not Found</div>;

  const average = (data.subjects.reduce((acc, curr) => acc + parseFloat(curr.total), 0) / data.subjects.length).toFixed(2);
  const isSSS = data.className.toLowerCase().includes("sss");
  const attendancePct = data.attendance?.total
    ? Math.round((data.attendance.present / data.attendance.total) * 100)
    : 0;

  return (
    <div className="p-4 md:p-12 bg-white flex flex-col min-h-screen md:min-h-[297mm] shadow-none print:p-8 w-full max-w-[210mm] mx-auto">

      {/* 1. HEADER BRANDING */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 border-b-2 border-slate-900 pb-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-3xl shrink-0">R</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
              Rubix International <br className="hidden sm:block" /> Schools
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Excellence • Integrity • Innovation</p>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="inline-block bg-slate-100 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-slate-600 mb-2">Official Academic Record</div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session: {data.academicYear}</p>
        </div>
      </div>

      {/* 2. STUDENT BIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 sm:col-span-2">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><User size={10} /> Student Name</span>
          <span className="text-base md:text-lg font-black text-slate-800 uppercase">{data.studentName}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Hash size={10} /> ID Number</span>
          <span className="text-xs md:text-sm font-bold text-slate-800 truncate">{data.studentId}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1"><Calendar size={10} /> Class</span>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase">{data.className}</span>
        </div>
      </div>

      {/* 3. PERFORMANCE SUMMARY */}
      <div className={`grid grid-cols-1 ${isSSS ? "md:grid-cols-1" : "md:grid-cols-2"} gap-4 md:gap-6 mb-8`}>
        <div className="border-2 border-indigo-100 bg-indigo-50/30 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0"><Award size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase">Weighted Average</p>
            <p className="text-2xl font-black text-indigo-900">{average}%</p>
          </div>
        </div>

        {!isSSS && data.position && (
          <div className="border-2 border-amber-100 bg-amber-50/30 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white shrink-0"><Award size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase">Rank in Class</p>
              <p className="text-2xl font-black text-amber-900">{data.position}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. RESULTS TABLE - 🎯 FIX: Wrapped inside a fluid scrollbox container to avoid mobile clipping */}
      <div className="w-full border-2 border-slate-200 rounded-2xl overflow-hidden mb-6">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px] md:min-w-0">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Subject Title</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest">CA (40)</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest">Exam (60)</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest">Total</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest">{isSSS ? "Grade" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((sub, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 even:bg-slate-50/50">
                  <td className="p-4 font-black text-slate-800 text-sm uppercase whitespace-normal">{sub.name}</td>
                  <td className="p-4 text-center font-bold text-slate-500 tabular-nums">{sub.ca}</td>
                  <td className="p-4 text-center font-bold text-slate-500 tabular-nums">{sub.exam}</td>
                  <td className="p-4 text-center font-black text-slate-900 tabular-nums text-base">{sub.total}%</td>
                  <td className="p-4 text-center">
                    <span className={`font-black text-xs uppercase ${parseFloat(sub.total) >= 70
                        ? "text-green-600"
                        : parseFloat(sub.total) >= 50
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}>
                      {sub.level || (
                        parseFloat(sub.total) >= 70
                          ? "Excellent"
                          : parseFloat(sub.total) >= 50
                            ? "Pass"
                            : "Fail"
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ATTENDANCE SUMMARY SECTION */}
      <div className="grid grid-cols-3 gap-0 mb-8 border-2 border-slate-900 rounded-xl overflow-hidden">
        <div className="border-r-2 border-slate-900 p-4 bg-slate-50">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Days School Opened</p>
          <p className="text-xl font-black text-slate-900 uppercase">{data.attendance?.total || 0}</p>
        </div>
        <div className="border-r-2 border-slate-900 p-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Days Present</p>
          <p className="text-xl font-black text-slate-900 uppercase">{data.attendance?.present || 0}</p>
        </div>
        <div className="p-4 bg-indigo-50">
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Percentage (%)</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-indigo-600 uppercase">{attendancePct}%</p>
            {attendancePct > 90 && <CheckCircle size={14} className="text-indigo-600" />}
          </div>
        </div>
      </div>

      {/* 6. REMARKS */}
      <div className="border-2 border-slate-900 p-5 rounded-xl bg-slate-50/50 mb-10">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <FileCheck size={12} /> Principal&apos;s Remarks
          </span>
          <p className="text-sm font-bold italic text-slate-900 uppercase leading-relaxed">
            &quot;{data.principalComment || "An impressive performance. Keep up the momentum in the coming term."}&quot;
          </p>
        </div>
      </div>

      {/* 7. SIGNATURES - 🎯 FIX: Balanced layout spacing to drop down gracefully on small screens */}
      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-20 md:gap-32 px-4 sm:px-10 pb-10 pt-12">
        <div className="flex flex-col items-center">
          <div className="w-full border-b-2 border-slate-900 mb-2 h-10 flex items-end justify-center" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Class Teacher</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full border-b-2 border-slate-900 mb-2 h-10 relative">
            <div className="absolute -top-6 right-0 w-20 h-20 border-4 border-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-200 rotate-12 uppercase text-center leading-none">
              School <br /> Seal
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Principal</p>
        </div>
      </div>

      <div className="text-center border-t border-slate-100 pt-4">
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
          Rubix International Schools • Generated for Academic Purposes
        </p>
      </div>
    </div>
  );
};

export default ReportCardSheet;