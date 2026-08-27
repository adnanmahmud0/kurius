import React from "react";
import type { Metadata } from "next";

import { VideoUploadForm } from "@/components/admin/video-upload-form";

export const metadata: Metadata = {
  title: "Upload Video | Kurius Admin",
  description: "Upload and publish a new video"
};

export default function VideoUploadPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <VideoUploadForm />
    </div>
  );
}
