import { prisma } from "@/lib/prisma";
import { updateActiveSession, createAcademicYear } from "@/lib/actions/session";
import { revalidatePath } from "next/cache";

const SettingsPage = async () => {
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { name: "desc" },
  });

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 m-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Academic Settings</h1>

      {/* --- ADD NEW YEAR SECTION --- */}
      <section className="mb-10 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          Create New Academic Session
        </h2>
        <form
          action={async (formData) => {
            "use server";
            const name = formData.get("yearName") as string;
            await createAcademicYear(name);
          }}
          className="flex gap-4"
        >
          <input
            name="yearName"
            placeholder="e.g. 2026/2027"
            className="flex-1 p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
            Add Year
          </button>
        </form>
      </section>

      {/* --- SESSION LIST SECTION --- */}
      <section>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
          Session History & Activation
        </h2>
        <div className="space-y-3">
          {academicYears.map((year) => (
            <div
              key={year.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                year.isCurrent 
                  ? "border-green-500 bg-green-50" 
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <p className="font-bold text-slate-800">{year.name}</p>
                {year.isCurrent && (
                  <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full uppercase font-bold">
                    Currently Active
                  </span>
                )}
              </div>

              {!year.isCurrent && (
                <form
                  action={async () => {
                    "use server";
                    await updateActiveSession(year.id);
                  }}
                >
                  <button className="text-sm border border-blue-600 text-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-50 transition">
                    Set as Active Session
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;