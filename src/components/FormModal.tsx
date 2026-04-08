"use client";

import { 
  deleteClass, deleteSubject, deleteTeacher, deleteStudent, 
  deleteExam, deleteParent, deleteAnnouncement, deleteEvent, 
  deleteResult, deleteAssignment, deleteLesson,
  deleteMessage
} from "@/lib/actions";
import { FormContainerProps } from "@/lib/types";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";

// Action Map for Deletion
const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject, 
  event: deleteEvent,
  announcement: deleteAnnouncement,
  message: deleteMessage,
};

// Lazy Loading Forms
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const StudentForm = dynamic(() => import("./forms/StudentForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const ClassForm = dynamic(() => import("./forms/ClassForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const ExamForm = dynamic(() => import("./forms/ExamForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const ParentForm = dynamic(() => import("./forms/ParentForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const EventForm = dynamic(() => import("./forms/EventForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const LessonForm = dynamic(() => import("./forms/LessonForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const ResultForm = dynamic(() => import("./forms/ResultForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });
const MessageForm = dynamic(() => import("./forms/MessageForm"), { loading: () => <h1 className="p-4 text-center font-bold">Loading Form...</h1> });

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => <SubjectForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  class: (setOpen, type, data, relatedData) => <ClassForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  teacher: (setOpen, type, data, relatedData) => <TeacherForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  student: (setOpen, type, data, relatedData) => <StudentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  exam: (setOpen, type, data, relatedData) => <ExamForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  parent: (setOpen, type, data, relatedData) => <ParentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  event: (setOpen, type, data, relatedData) => <EventForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  assignment: (setOpen, type, data, relatedData) => <AssignmentForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  message: (setOpen, type, data, relatedData) => <MessageForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction] = useFormState(deleteActionMap[table], {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error("An error occurred during deletion.");
    }
  }, [state, router, table]);

  // Size logic for the trigger button
  const size = type === "create" ? "w-8 h-8" : "w-8 h-8";

  // Color logic for the trigger button
  const bgColor = 
    type === "create" ? "bg-rubixYellow" : 
    type === "update" ? "bg-rubixSky" : "bg-red-500"; // Red is safer for Delete visually

  const renderForm = () => {
    if (type === "delete" && id) {
      return (
        <form action={formAction} className="p-8 flex flex-col gap-6 items-center">
          <input type="hidden" name="id" value={id} />
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-2">
            <Trash2 size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              All data related to this {table} will be permanently removed. <br/>
              This action cannot be undone.
            </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl font-bold transition-all shadow-lg shadow-red-100 active:scale-95">
            Yes, Delete it
          </button>
        </form>
      );
    }

    if (type === "create" || type === "update") {
      return forms[table] ? (
        forms[table](setOpen, type, data, relatedData)
      ) : (
        <div className="p-10 text-center font-bold text-slate-400 uppercase tracking-widest">
           Form Under Development
        </div>
      );
    }

    return "Form not found!";
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:brightness-95 transition-all shadow-sm active:scale-90`}
        onClick={() => setOpen(true)}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      >
        {type === "create" && <Plus size={18} className="text-slate-800" />}
        {type === "update" && <Pencil size={14} className="text-slate-800" />}
        {type === "delete" && <Trash2 size={14} className="text-white" />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="p-2">
              {renderForm()}
            </div>
            
            <button
              className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition-all"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;