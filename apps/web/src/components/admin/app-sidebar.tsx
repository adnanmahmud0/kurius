"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  FileText,
  Film,
  FolderTree,
  HardDrive,
  Home,
  LogOut,
  Mail,
  Quote,
  Shield,
  Upload,
  Users,
  Video,
  X
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

import { useAdminSidebar } from "./admin-sidebar-context";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: Video
  },
  {
    title: "Upload Video",
    href: "/admin/videos/upload",
    icon: Upload
  },
  {
    title: "Motivational Quotes",
    href: "/admin/messages",
    icon: Quote
  },
  {
    title: "Users & Analytics",
    href: "/admin/users",
    icon: Users
  }
];

const settingsNavItems = [
  {
    title: "Media Library",
    href: "/admin/media",
    icon: Film
  },
  {
    title: "Storage Settings",
    href: "/admin/settings/storage",
    icon: HardDrive
  },
  {
    title: "Email Settings",
    href: "/admin/settings/email",
    icon: Mail
  },
  {
    title: "Privacy Policy",
    href: "/admin/settings/privacy",
    icon: Shield
  },
  {
    title: "Terms of Service",
    href: "/admin/settings/terms",
    icon: FileText
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobileOpen, closeMobile } = useAdminSidebar();

  const handleLogout = async () => {
    closeMobile();
    await logout();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden",
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar (Desktop fixed, Mobile sliding drawer) */}
      <aside
        className={cn(
          "border-border bg-card fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out md:z-30 md:w-64 md:translate-x-0 md:shadow-xs",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo & Mobile Close Button */}
        <div className="border-border flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg font-bold shadow-xs">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-base font-bold tracking-tight">Kurius</span>
              <span className="text-muted-foreground text-xs font-medium">Admin Console</span>
            </div>
          </div>

          {/* Dedicated Close Button for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            className="text-muted-foreground hover:text-foreground h-8 w-8 md:hidden"
            title="Close sidebar"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <div>
            <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
              Management
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : item.href === "/admin/videos"
                      ? pathname === "/admin/videos" ||
                        (pathname.startsWith("/admin/videos/") &&
                          pathname !== "/admin/videos/upload")
                      : item.href === "/admin/videos/upload"
                        ? pathname === "/admin/videos/upload"
                        : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
              System & Legal
            </p>
            <nav className="space-y-1">
              {settingsNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <Separator />

        {/* Admin User Profile & Logout */}
        <div className="bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="border-border h-9 w-9 border">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || "Admin"} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.name?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground truncate text-xs font-semibold">
                  {user?.name || "Admin"}
                </span>
                <span className="text-muted-foreground truncate text-[10px]">
                  {user?.email || "admin@kurius.com"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
