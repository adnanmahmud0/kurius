import React from "react";
import type { Metadata } from "next";

import { MotivationalMessagesTable } from "@/components/admin/motivational-messages-table";

export const metadata: Metadata = {
  title: "Motivational Quotes | Kurius Admin",
  description: "Manage random motivational quotes shown in the mobile app feed"
};

export default function MotivationalMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Motivational Quotes</h1>
        <p className="text-muted-foreground text-xs">
          Configure inspiring quotes delivered randomly to mobile app users.
        </p>
      </div>

      <MotivationalMessagesTable />
    </div>
  );
}
