"use client";

import React from "react";
import { useParams } from "next/navigation";

import { UserDetailPanel } from "@/components/admin/user-detail-panel";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <UserDetailPanel userId={userId} />
    </div>
  );
}
