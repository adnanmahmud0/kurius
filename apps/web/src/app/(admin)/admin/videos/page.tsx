import React from "react";
import type { Metadata } from "next";

import { VideoTable } from "@/components/admin/video-table";

export const metadata: Metadata = {
  title: "Videos | Kurius Admin",
  description: "Video catalog and content management"
};

export default function VideosPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <VideoTable />
    </div>
  );
}
