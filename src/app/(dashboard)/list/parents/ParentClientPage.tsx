"use client";

import AnnouncementModal from "@/components/AnnouncementModal";
import Announcements from "@/components/Announcements";
import { useState } from "react";



const ParentClientPage = ({ announcements, events, messages }: any) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  return (
    <div className="w-full">
      {/* Your Message/Inbox UI here */}
      
      {/* We pass the select handler directly to the component */}
      <Announcements 
        data={announcements} 
        onSelect={(ann) => setSelectedAnnouncement(ann)} 
      />

      {/* The Modal listens for the state change */}
      <AnnouncementModal 
        announcement={selectedAnnouncement} 
        onClose={() => setSelectedAnnouncement(null)} 
      />
    </div>
  );
};

export default ParentClientPage;