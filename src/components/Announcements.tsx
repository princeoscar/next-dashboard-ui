"use client";

import { useEffect, useState } from "react";

const Announcements = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/announcements-latest");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Announcements fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const bgColors = ["bg-rubixSkyLight", "bg-rubixPurpleLight", "bg-rubixYellowLight"];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400 cursor-pointer">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length > 0 ? (
          data.map((announcement, index) => (
            <div key={announcement.id} className={`${bgColors[index % 3]} rounded-md p-4`}>
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(new Date(announcement.date))}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{announcement.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center">No recent announcements.</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;