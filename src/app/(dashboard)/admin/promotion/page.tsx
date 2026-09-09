import {
  getPromotionPreview,
  getPromotionStats,
} from "@/lib/actions/promotion";
import PromotionButton from "@/components/Promotion/PromotionButton";

export default async function PromotePage() {
  const students = await getPromotionPreview();
  const stats = await getPromotionStats();

  return (
    <div className="bg-white rounded-xl p-6">

      <div>
        <h1 className="text-2xl font-bold">
          Student Promotion
        </h1>

        <p className="text-gray-500">
          Review promotion results based on student performance.
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <PromotionButton />
      </div>


      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">

        <div className="bg-blue-50 rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">
            Total Students
          </p>

          <h2 className="text-4xl font-black mt-2">
            {stats.totalStudents}
          </h2>
        </div>


        <div className="bg-green-50 rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">
            Promoted
          </p>

          <h2 className="text-4xl font-black mt-2">
            {stats.promoted}
          </h2>
        </div>


        <div className="bg-red-50 rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">
            Retained
          </p>

          <h2 className="text-4xl font-black mt-2">
            {stats.retained}
          </h2>
        </div>


        <div className="bg-yellow-50 rounded-xl p-5 border">
          <p className="text-gray-500 text-sm">
            Pending Review
          </p>

          <h2 className="text-4xl font-black mt-2">
            {stats.pending}
          </h2>
        </div>

      </div>



      {/* Students Table */}
      <div className="mt-10 overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="border-b bg-slate-50">

              <th className="text-left p-3">
                Student
              </th>

              <th className="text-left p-3">
                Current Class
              </th>

              <th className="text-left p-3">
                Average
              </th>

              <th className="text-left p-3">
                Next Class
              </th>

              <th className="text-left p-3">
                Decision
              </th>

            </tr>

          </thead>


          <tbody>

            {students.map((student) => (

              <tr
                key={student.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-3">

                  <div className="font-semibold">
                    {student.name} {student.surname}
                  </div>

                  <div className="text-xs text-gray-500">
                    {student.admissionNumber}
                  </div>

                </td>


                <td className="p-3">
                  {student.class?.name}
                </td>


                <td className="p-3">
                  {student.average.toFixed(2)}%
                </td>

                <td className="p-3">

                  {student.nextClass
                    ? student.nextClass.name
                    : "-"}

                </td>


                <td className="p-3">

                  {student.average >= 50 ? (

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      PROMOTED
                    </span>

                  ) : (

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      RETAINED
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}