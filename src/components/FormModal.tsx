"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { 
  deleteAnnouncement, 
  deleteAssignment, 
  deleteClass, 
  deleteEvent, 
  deleteExam, 
  deleteLesson, 
  deleteParent, 
  deleteResult, 
  deleteStudent, 
  deleteSubject, 
  deleteTeacher,
  deleteGrade, 
} from "@/lib/actions";

// 1. Action Map for Deletions
const deleteActionMap: any = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  event: deleteEvent,
  lesson: deleteLesson,
  announcement: deleteAnnouncement,
  result: deleteResult,
  parent: deleteParent,
  assignment: deleteAssignment,
  grade: deleteGrade,
};

// 2. Dynamic Imports
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <h1>Loading...</h1> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <h1>Loading...</h1> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <h1>Loading...</h1> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <h1>Loading...</h1> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <h1>Loading...</h1> });
const MessageForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <h1>Loading...</h1> });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading: () => <h1>Loading...</h1> });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading: () => <h1>Loading...</h1> });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading: () => <div>Loading...</div> });
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading: () => <div>Loading...</div> });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <div>Loading...</div> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <div>Loading...</div> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <div>Loading...</div> });
const GradeForm = dynamic(() => import("./forms/GradeForm"), { loading: () => <h1>Loading...</h1> });

// 3. Form Mapping
const forms: {
  [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  message: (setOpen, type, data, relatedData) => <MessageForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  grade: (setOpen, type, data) => <GradeForm type={type} data={data} setOpen={setOpen} />,
};

const FormModal = ({ table, type, data, id, relatedData }: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = type === "create" ? "bg-rubixYellow" : type === "update" ? "bg-rubixSky" : "bg-rubixPurple";
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, deleteAction] = useActionState(deleteActionMap[table] || (() => {}), {
  success: false,
  error: false,
  message: "",
});

  useEffect(() => {
    if (state.success) {
      toast.success(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, table]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [open]);

  return (
    <>
      <button 
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`} 
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-full h-screen fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
  
  <div className="bg-white rounded-[2rem] w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
    
    {/* CLOSE BUTTON */}
    <div
      className="absolute top-5 right-5 z-50 p-2 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer"
      onClick={() => setOpen(false)}
    >
      <Image src="/close.png" alt="" width={12} height={12} />
    </div>

    {/* ONLY SCROLLABLE AREA */}
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {type === "delete" && id ? (
        <form action={deleteAction} className="flex flex-col gap-4 py-10 px-6">
          <input type="hidden" name="id" value={id} />
          <span className="text-center font-bold text-lg">
            Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-600 text-white py-3 px-8 rounded-2xl w-max self-center">
            Delete
          </button>
        </form>
      ) : (type === "create" || type === "update") ? (
        forms[table] ? (
          forms[table](setOpen, type, data, relatedData)
        ) : (
          <div className="p-4 text-center">Form missing</div>
        )
      ) : null}
    </div>
  </div>
</div>
      )}
    </>
  );
};

export default FormModal;