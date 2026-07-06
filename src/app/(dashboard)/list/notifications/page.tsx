import { prisma } from "@/lib/prisma";

const NotificationHistoryPage = async () => {
  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true, surname: true } } },
    take: 50, // Only show last 50
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-6">Notification Logs</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-xs font-bold uppercase tracking-wider text-slate-500">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Type</th>
              <th className="p-4">Message</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 text-slate-800">{log.student.name} {log.student.surname}</td>
                <td className="p-4">{log.type}</td>
                <td className="p-4 max-w-xs truncate">{log.message}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full ${log.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4">{log.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationHistoryPage;