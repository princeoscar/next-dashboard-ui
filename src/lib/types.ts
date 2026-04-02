export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement"
  | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
  teacherId?: string;
};