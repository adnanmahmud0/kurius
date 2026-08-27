import React from "react";
import type { Metadata } from "next";

import { CategoryTable } from "@/components/admin/category-table";

export const metadata: Metadata = {
  title: "Categories | Kurius Admin",
  description: "Manage video topic categories"
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <CategoryTable />
    </div>
  );
}
