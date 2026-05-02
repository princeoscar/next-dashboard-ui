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
  subjects: { title: string; start: Date; end: Date }[]
) => {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  startOfWeek.setDate(diff);

  return subjects.map((subject) => {
    const subjectDay = subject.start.getDay();
    const daysFromMonday = subjectDay === 0 ? 6 : subjectDay - 1;

    const adjustedStartDate = new Date(startOfWeek);
    adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);
    adjustedStartDate.setHours(subject.start.getHours(), subject.start.getMinutes(), 0);

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(subject.end.getHours(), subject.end.getMinutes(), 0);

    return {
      title: subject.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};