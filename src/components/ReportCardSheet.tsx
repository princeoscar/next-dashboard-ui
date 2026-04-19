"use client";

import React from 'react';
import { FileCheck, Award, Calendar, User, Hash } from 'lucide-react';

interface SubjectResult {
  name: string;
  ca: number;
  exam: number;
  total: string;
  grade: string;
}

interface ReportCardProps {
  data: {
    studentName: string;
    studentId: string;
    className: string;
    subjects: SubjectResult[];
    academicYear: string;
  };
}

const ReportCardSheet = ({ data }: ReportCardProps) => {
  if (!data || !data.subjects) return <div className="p-10 text-red-500 font-bold">Data processing error: No subjects found.</div>;

  const average = (data.subjects.reduce((acc, curr) => acc + parseFloat(curr.total), 0) / data.subjects.length).toFixed(2);

  return (
    // Change 1: Reduced padding on mobile (p-4), kept desktop/print padding (md:p-12 print:p-8)
    <div className="p-4 md:p-12 bg-white flex flex-col min-h-screen md:min-h-[297mm] shadow-none print:p-8">
      
      {/* 1. TOP BRANDING BAR - Stacked on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 border-b-2 border-slate-900 pb-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-3xl shrink-0">
            R
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
              Rubix International <br className="hidden sm:block" /> Schools
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Excellence • Integrity • Innovation
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="inline-block bg-slate-100 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-slate-600 mb-2">
            Official Academic Record
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session: {data.academicYear}</p>
        </div>
      </div>

      {/* 2. STUDENT INFORMATION GRID - Responsive Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 sm:col-span-2">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
            <User size={10} /> Full Name of Student
          </span>
          <span className="text-base md:text-lg font-black text-slate-800 uppercase">{data.studentName}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Hash size={10} /> Student ID
          </span>
          <span className="text-xs md:text-sm font-bold text-slate-800 truncate">{data.studentId}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
            <Calendar size={10} /> Class/Grade
          </span>
          <span className="text-xs md:text-sm font-black text-slate-800 uppercase">{data.className}</span>
        </div>
      </div>

      {/* 3. PERFORMANCE SUMMARY CARDS - Stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="border-2 border-indigo-100 bg-indigo-50/30 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0"><Award size={20}/></div>
            <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase">Average</p>
                <p className="text-2xl font-black text-indigo-900">{average}%</p>
            </div>
        </div>
        <div className="border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-4 md:col-span-2">
            <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 shrink-0"><FileCheck size={20}/></div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Principal&apos;s Remark</p>
                <p className="text-xs font-bold text-slate-600 leading-tight">
                    {parseFloat(average) > 70 ? "Excellent performance. Keep maintaining this high standard." : "Good effort. More focus required in core subjects."}
                </p>
            </div>
        </div>
      </div>

      {/* 4. RESULTS TABLE - Horizontal scroll for mobile */}
      <div className="w-full border-2 border-slate-200 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto"> {/* Critical for mobile table view */}
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900">
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Subject</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">C.A (40)</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Exam (60)</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Total</th>
                <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.subjects.map((sub, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 even:bg-slate-50/50">
                  <td className="p-4 font-black text-slate-800 text-sm uppercase">{sub.name}</td>
                  <td className="p-4 text-center font-bold text-slate-500 tabular-nums">{sub.ca}</td>
                  <td className="p-4 text-center font-bold text-slate-500 tabular-nums">{sub.exam}</td>
                  <td className="p-4 text-center font-black text-slate-900 tabular-nums text-base">{sub.total}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md font-black text-xs border ${
                      sub.grade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sub.grade === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {sub.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. GRADING SCALE KEY - Wrapped for mobile */}
      <div className="flex flex-col sm:flex-row gap-2 mb-12">
        <div className="text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap pt-1">Grading Scale:</div>
        <div className="flex flex-wrap gap-2">
            {['A: 80-100', 'B: 60-79', 'C: 50-59', 'D: 45-49', 'F: 0-44'].map(scale => (
                <div key={scale} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">{scale}</div>
            ))}
        </div>
      </div>

      {/* 6. SIGNATURE SECTION - Responsive spacing */}
      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-32 px-4 md:px-10">
        <div className="flex flex-col items-center">
          <div className="w-full border-b-2 border-slate-900 mb-2 h-10 flex items-end justify-center" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Teacher&apos;s Signature</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-full border-b-2 border-slate-900 mb-2 h-10 relative">
             <div className="absolute -top-4 right-0 w-12 h-12 md:w-16 md:h-16 border-4 border-slate-100 rounded-full flex items-center justify-center text-[7px] font-black text-slate-200 rotate-12 uppercase text-center leading-none">
                School <br/> Seal
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Principal&apos;s Signature</p>
        </div>
      </div>
      
      {/* 7. AUTHENTICATION FOOTER */}
      <div className="mt-12 text-center border-t border-slate-100 pt-4">
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
          Computer generated. contact registrar@rubixschools.com
        </p>
      </div>
    </div>
  );
};

export default ReportCardSheet;