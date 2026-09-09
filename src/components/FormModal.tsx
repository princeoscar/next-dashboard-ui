"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
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
  deleteParent,
  deleteResult,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteLevel,
  deleteStream,
  deleteLesson,
  deleteIncome,
  deleteExpense,
  deletePaymentRecord
} from "@/lib/server-actions";

// 1. Action Map for Deletions
const deleteActionMap: any = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  result: deleteResult,
  parent: deleteParent,
  assignment: deleteAssignment,
  level: deleteLevel,
  stream: deleteStream,
  lesson: deleteLesson,
  income: deleteIncome,
  expense: deleteExpense,
  paymentRecord: deletePaymentRecord
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
const LevelForm = dynamic(() => import("./forms/LevelForm"), { loading: () => <h1>Loading...</h1> });
const StreamForm = dynamic(() => import("./forms/StreamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AdminForm = dynamic(() => import("./forms/AdminForm"), { loading: () => <h1>Loading...</h1> });
const IncomeForm = dynamic(() => import("./forms/IncomeForm"), { loading: () => <div>Loading...</div> });
const ExpenseForm = dynamic(() => import("./forms/ExpenseForm"), { loading: () => <h1>Loading...</h1> });
const PaymentRecordForm = dynamic(() => import("./forms/PaymentRecordForm"), { loading: () => <div>Loading...</div> });

// 3. Form Mapping
const forms: {
  [key: string]: (setOpen: Dispatch<SetStateAction<boolean>>, type: "create" | "update", data?: any, relatedData?: any, schoolId?: string,) => JSX.Element;
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
  result: (setOpen, type, data, relatedData) => <ResultForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  attendance: (setOpen, type, data, relatedData) => <AttendanceForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  announcement: (setOpen, type, data, relatedData) => <AnnouncementForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  level: (setOpen, type, data, relatedData, schoolId) => <LevelForm type={type} data={data} schoolId={schoolId ?? ""} setOpen={setOpen} />,
  stream: (setOpen, type, data, relatedData) => (<StreamForm type={type}
    data={data}
    setOpen={setOpen}
    relatedData={relatedData}
  />
  ),
  lesson: (setOpen, type, data, relatedData) => <LessonForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  admin: (setOpen, type, data) => <AdminForm type={type} data={data} setOpen={setOpen} />,
  income: (setOpen, type, data, relatedData) => <IncomeForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  expense: (setOpen, type, data, relatedData) => <ExpenseForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
  paymentRecord: (setOpen, type, data, relatedData) => <PaymentRecordForm type={type} data={data} setOpen={setOpen} relatedData={relatedData} />,
};

const FormModal = ({ table, type, data, id, relatedData, schoolId, }: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-rubixYellow"
      : type === "update"
        ? "bg-rubixSky"
        : "bg-rubixPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, deleteAction] = useActionState(deleteActionMap[table] || (() => { }), {
      success: false,
      error: false,
      message: "",
    });

    const router = useRouter();

    useEffect(() => {
  if (state.success) {
    toast.success(
      state.message ||
        `${table} ${
          type === "create"
            ? "created"
            : type === "update"
            ? "updated"
            : "deleted"
        } successfully!`
    );

    setOpen(false);
    router.refresh();
  }

  if (state.error) {
    toast.error(
      state.message || "Something went wrong!"
    );
  }
}, [state, router, table, type]);

    return type === "delete" && id ? (
      <form action={deleteAction} className="p-6 flex flex-col gap-6">
        <input type="hidden" name="id" value={id} />
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
          <p className="text-slate-500 text-sm">
            All data will be lost. Are you sure you want to delete this {table}?
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-xl transition shadow-md">
            Delete Permanently
          </button>
        </div>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table] ? (
        forms[table](setOpen, type, data, relatedData, schoolId)
      ) : (
        <div className="p-10 text-center text-slate-400 italic">Form container is ready, but {table} form is missing.</div>
      )
    ) : (
      "Form not found!"
    );
  };

 return (
  <>
    <button
      type="button"
      className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:scale-105 transition-transform shadow-sm`}
      onClick={() => setOpen(true)}
    >
      <Image
        src={`/${type}.png`}
        alt=""
        width={16}
        height={16}
      />
    </button>

    {open &&
      typeof document !== "undefined" &&
      createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">

          {/* MODAL */}
          <div
            className="
              relative
              flex
              flex-col
              w-full
              max-w-2xl
              max-h-[calc(100vh-32px)]
              bg-white
              rounded-3xl
              shadow-2xl
              border
              border-slate-100
              overflow-hidden
              animate-in
              fade-in
              zoom-in-95
              duration-200
            "
          >

            {/* HEADER */}
            <div
              className="
                shrink-0
                flex
                items-center
                justify-between
                px-6
                py-4
                bg-white
                border-b
                border-slate-100
              "
            >
              <div>
                <h2 className="text-lg font-bold text-slate-800 capitalize">
                  {type === "create"
                    ? `Add New ${table}`
                    : `Update ${table}`}
                </h2>

                <p className="text-xs text-slate-400">
                  Fill in the form below to manage {table} details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  h-8
                  w-8
                  rounded-full
                  bg-slate-50
                  border
                  border-slate-200
                  flex
                  items-center
                  justify-center
                  text-slate-500
                  hover:bg-slate-100
                  transition
                "
              >
                ✕
              </button>
            </div>

            {/* FORM AREA */}
            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                scrollbar-thin
                scrollbar-thumb-slate-200
                scrollbar-track-transparent
              "
            >
              <Form />
            </div>

          </div>
        </div>,

        document.body
      )}
  </>
);
};

export default FormModal;