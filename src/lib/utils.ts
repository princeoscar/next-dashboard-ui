import { auth } from "@clerk/nextjs/server";

export const currentUserId = async () => {
  const { userId } = await auth();
  return userId;
};

export const getRole = async () => {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: string })?.role;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
) => {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  startOfWeek.setDate(diff);

  return lessons.map((lesson) => {
    const lessonDay = lesson.start.getDay();
    const daysFromMonday = lessonDay === 0 ? 6 : lessonDay - 1;

    const adjustedStartDate = new Date(startOfWeek);
    adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);
    adjustedStartDate.setHours(lesson.start.getHours(), lesson.start.getMinutes(), 0);

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(lesson.end.getHours(), lesson.end.getMinutes(), 0);

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};