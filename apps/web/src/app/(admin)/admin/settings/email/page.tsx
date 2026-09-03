import React from "react";
import type { Metadata } from "next";

import { EmailSettingsForm } from "@/components/admin/email-settings-form";

export const metadata: Metadata = {
  title: "Email Settings | Kurius Admin",
  description: "Configure SMTP, Resend, and domain email credentials"
};

export default function EmailSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <EmailSettingsForm />
    </div>
  );
}
