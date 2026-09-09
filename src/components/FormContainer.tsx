"use client"; 

import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
    | "level"
    | "class"
    | "admin"
    | "subject"
    | "attendance"
    | "lesson"
    | "student"
    | "teacher"
    | "parent"
    | "stream"
    | "exam"
    | "assignment"
    | "result"
    | "event"
    | "announcement"
    | "message"
    | "paymentRecord"
    | "income"
    | "expense";
  type: "create" | "update" | "delete" 
  
  schoolId?: string;

  data?: any;
  id?: number | string;
  relatedData?: any;
   teacherId?: string;
  
};

const FormContainer = ({ 
  table, 
  type, 
  data, 
  id, 
  relatedData,
  schoolId,
}: FormContainerProps) => {
  
  // 💡 Logic:
  // Instead of this file fetching data, it now simply receives it as a prop.
  // The StudentListPage (Server) fetches the data.
  // The ClassSelector (Client) passes it through.
  // This satisfies the Next.js rule: Keep DB fetching on the Page!

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
        schoolId={schoolId}
      />
    </div>
  );

  
};

export default FormContainer;