import { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = {
  title: "Media Library | Kurius Admin",
  description: "Browse, preview, and manage all uploaded videos and thumbnail assets."
};

export default function MediaPage() {
  return (
    <div className="container mx-auto max-w-7xl p-6">
      <MediaLibrary />
    </div>
  );
}
