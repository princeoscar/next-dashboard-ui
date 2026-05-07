"use client"; // 🚀 This is the magic line that fixes the build error

import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
    | "teacher" | "student" | "parent" | "subject" | "class"
    | "subject" | "exam" | "assignment" | "result" | "attendance"
    | "event" | "admin" | "announcement" | "message" | "level" | "lesson";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = ({ 
  table, 
  type, 
  data, 
  id, 
  relatedData 
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
      />
    </div>
  );
};

export default FormContainer;