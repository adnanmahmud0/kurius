"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { ExternalLink, Menu, ShieldCheck } from "lucide-react";

import { AnimatedThemeToggler } from "@/ui/animated-theme-toggler";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

import { useAdminSidebar } from "./admin-sidebar-context";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/categories": "Category Management",
  "/admin/videos": "Video Library",
  "/admin/videos/upload": "Upload New Video",
  "/admin/messages": "Motivational Quotes",
  "/admin/media": "Media Library",
  "/admin/users": "Users & Engagement Analytics",
  "/admin/settings/storage": "Storage Provider Configuration",
  "/admin/settings/email": "Email & SMTP Configuration",
  "/admin/settings/privacy": "Privacy Policy Editor",
  "/admin/settings/terms": "Terms of Service Editor"
};

export function SiteHeader() {
  const pathname = usePathname();
  const { toggleMobile } = useAdminSidebar();
  const currentTitle =
    pageTitles[pathname] ||
    (pathname.includes("/admin/users/") ? "User Engagement Profile" : "Admin Console");

  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6 md:px-8">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobile}
          className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0 md:hidden"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        <h1 className="text-foreground truncate text-base font-bold tracking-tight sm:text-lg md:text-xl">
          {currentTitle}
        </h1>
        <Badge
          variant="outline"
          className="text-primary border-primary/30 bg-primary/5 hidden gap-1.5 text-xs lg:inline-flex"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Mode
        </Badge>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="hidden gap-1.5 text-xs sm:flex">
            <ExternalLink className="h-3.5 w-3.5" />
            Public Privacy
          </Button>
        </a>
        <AnimatedThemeToggler />
      </div>
    </header>
  );
}
