"use client";

import React from 'react';

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
  };
}

const ReportCardSheet = ({ data }: ReportCardProps) => {
  // 1. Safety check
  if (!data || !data.subjects) return <div className="p-10 text-red-500 font-bold">Data processing error: No subjects found.</div>;

  return (
    <div className="bg-white p-12 shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between border border-slate-200">
      <div>
        {/* Header with Student Info */}
        <div className="flex justify-between border-b-2 border-slate-800 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-900">Rubix Schools</h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Termly Progress Report</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">{data.studentName}</h2>
            <p className="text-sm text-slate-500 font-medium">
              Class: <span className="text-slate-900 font-bold">{data.className}</span> | ID: <span className="text-slate-900 font-bold">{data.studentId}</span>
            </p>
          </div>
        </div>

        {/* The Results Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] font-black tracking-widest">
              <th className="p-4 text-left border border-slate-200">Subject</th>
              <th className="p-4 text-center border border-slate-200">C.A. (40%)</th>
              <th className="p-4 text-center border border-slate-200">Exam (60%)</th>
              <th className="p-4 text-center border border-slate-200">Total</th>
              <th className="p-4 text-center border border-slate-200">Grade</th>
            </tr>
          </thead>
          <tbody>
            {data.subjects.map((s) => (
              <tr key={s.name} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold border border-slate-200 text-slate-700">{s.name}</td>
                <td className="p-4 text-center border border-slate-200 text-slate-600 font-medium">{s.ca}</td>
                <td className="p-4 text-center border border-slate-200 text-slate-600 font-medium">{s.exam}</td>
                <td className="p-4 text-center border border-slate-200 font-black text-indigo-600 tabular-nums">
                  {s.total}
                </td>
                <td className="p-4 text-center border border-slate-200">
                  <span className={`font-black ${s.grade === 'F' ? 'text-rose-500' : 'text-slate-700'}`}>
                    {s.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between mt-20 italic text-slate-400 text-xs font-bold uppercase tracking-tighter">
        <div className="border-t-2 border-slate-100 pt-4 w-52 text-center">
          <p>Class Teacher&apos;s Signature</p>
        </div>
        <div className="border-t-2 border-slate-100 pt-4 w-52 text-center">
          <p>Principal&apos;s Signature & Stamp</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardSheet;