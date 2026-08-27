"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ExternalLink, ShieldCheck } from "lucide-react";

import { AnimatedThemeToggler } from "@/ui/animated-theme-toggler";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/categories": "Category Management",
  "/admin/videos": "Video Library",
  "/admin/videos/upload": "Upload New Video",
  "/admin/users": "Users & Engagement Analytics",
  "/admin/settings/storage": "Storage Provider Configuration",
  "/admin/settings/privacy": "Privacy Policy Editor",
  "/admin/settings/terms": "Terms of Service Editor"
};

export function SiteHeader() {
  const pathname = usePathname();
  const currentTitle =
    pageTitles[pathname] ||
    (pathname.includes("/admin/users/") ? "User Engagement Profile" : "Admin Console");

  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h1 className="text-foreground text-xl font-bold tracking-tight">{currentTitle}</h1>
        <Badge
          variant="outline"
          className="text-primary border-primary/30 bg-primary/5 hidden gap-1.5 text-xs sm:inline-flex"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Mode
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/privacy" target="_blank">
          <Button variant="outline" size="sm" className="hidden gap-1.5 text-xs md:flex">
            <ExternalLink className="h-3.5 w-3.5" />
            Public Privacy
          </Button>
        </Link>
        <AnimatedThemeToggler />
      </div>
    </header>
  );
}
