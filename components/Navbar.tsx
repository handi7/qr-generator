"use client";

import Link from "next/link";
import React from "react";
import ThemeSwitch from "./ThemeSwitch";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(25,194,160,0.20),transparent_50%),radial-gradient(900px_circle_at_90%_-20%,rgba(66,103,178,0.14),transparent_45%)]" />

      <nav className="relative mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
            QR
          </span>

          <span className="hidden sm:block">
            <strong className="block text-sm leading-none">QR Studio</strong>
            <span className="text-xs text-foreground/70">Design and download instantly</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            key="Templates"
            href="/templates"
            className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
          >
            Templates
          </Link>

          <Link
            href="/studio"
            className="inline-flex items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/15 sm:text-sm"
          >
            New QR
          </Link>

          <ThemeSwitch />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
