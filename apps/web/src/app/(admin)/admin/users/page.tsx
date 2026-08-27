import React from "react";
import type { Metadata } from "next";

import { UserTable } from "@/components/admin/user-table";

export const metadata: Metadata = {
  title: "Users & Analytics | Kurius Admin",
  description: "User accounts, verification, and engagement directory"
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <UserTable />
    </div>
  );
}
