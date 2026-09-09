"use client";

import AnnouncementModal from "@/components/AnnouncementModal";
import Announcements from "@/components/Announcements";
import { useState } from "react";

const ParentClientPage = ({ announcements }: any) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  return (
    <div className="w-full">
      <Announcements
        data={announcements}
        onSelect={setSelectedAnnouncement}
      />

      <AnnouncementModal
        announcement={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

export default ParentClientPage;