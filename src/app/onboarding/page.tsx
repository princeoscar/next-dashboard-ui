import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSchool } from "@/lib/actions";

const OnboardingPage = async () => {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");

  // If they already have a school, send them to the dashboard
  const schoolId = (sessionClaims?.metadata as { schoolId?: string })?.schoolId;
  if (schoolId) redirect("/admin");

  const handleSubmit = async (formData: FormData) => {
    "use server";
    await createSchool(formData, userId);
    redirect("/admin");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-rubixSkyLight p-4">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-2">Welcome to Rubix!</h1>
        <p className="text-gray-500 mb-6">Let&apos;s set up your school profile to get started.</p>
        
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">School Name</label>
            <input
              name="schoolName"
              type="text"
              placeholder="e.g. Greatness International Academy"
              required
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md outline-none focus:ring-rubixPurple"
            />
          </div>
          <button className="bg-rubixPurple text-white p-2 rounded-md font-medium hover:bg-opacity-90 transition-all">
            Finish Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;