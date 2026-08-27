import React from "react";
import type { Metadata } from "next";

import { StorageSettingsForm } from "@/components/admin/storage-settings-form";

export const metadata: Metadata = {
  title: "Storage Settings | Kurius Admin",
  description: "Configure local and cloud storage providers"
};

export default function StorageSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <StorageSettingsForm />
    </div>
  );
}
