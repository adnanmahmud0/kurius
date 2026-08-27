import React from "react";
import type { Metadata } from "next";

import { LegalPolicyEditor } from "@/components/admin/legal-policy-editor";

export const metadata: Metadata = {
  title: "Edit Terms of Service | Kurius Admin",
  description: "Update terms of service content"
};

export default function AdminTermsSettingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <LegalPolicyEditor type="terms" />
    </div>
  );
}
