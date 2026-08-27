import React from "react";
import type { Metadata } from "next";

import { LegalPolicyEditor } from "@/components/admin/legal-policy-editor";

export const metadata: Metadata = {
  title: "Edit Privacy Policy | Kurius Admin",
  description: "Update privacy policy content"
};

export default function AdminPrivacySettingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <LegalPolicyEditor type="privacy" />
    </div>
  );
}
