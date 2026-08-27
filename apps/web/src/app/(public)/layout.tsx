import type { ReactNode } from "react";
import Link from "next/link";

import { AnimatedThemeToggler } from "@/ui/animated-theme-toggler";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Minimal Header */}
      <header className="border-border/60 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-md sm:px-12">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
            K
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">Kurius</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
          >
            Terms
          </Link>
          <AnimatedThemeToggler />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">{children}</main>

      {/* Minimal Footer */}
      <footer className="border-border/40 text-muted-foreground border-t px-6 py-4 text-center text-xs">
        &copy; {new Date().getFullYear()} Kurius Video Platform. All rights reserved.
      </footer>
    </div>
  );
}
