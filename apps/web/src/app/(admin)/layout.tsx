"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

import { AdminSidebarProvider } from "@/components/admin/admin-sidebar-context";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SiteHeader } from "@/components/admin/site-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  // Initial SSR render and pre-mount hydration: render a clean deterministic loading placeholder
  if (!isMounted || isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-xs font-semibold">
            Authenticating admin console...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminSidebarProvider>
      <div className="bg-background text-foreground flex min-h-screen">
        {/* Responsive Sidebar (docked on desktop, drawer on mobile) */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col md:pl-64">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
