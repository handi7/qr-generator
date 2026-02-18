"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Icon from "./Shared/Icon";

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-9 w-16 items-center rounded-full border border-foreground/15 bg-foreground/5 p-1 transition-colors duration-300 hover:bg-foreground/10"
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span
          className={`absolute left-2 top-1.5 h-1 w-1 rounded-full bg-sky-200/80 transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          className={`absolute right-2.5 top-2 h-0.5 w-0.5 rounded-full bg-sky-100 transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>

      <motion.span
        initial={false}
        animate={{ x: isDark ? 28 : 0, rotate: isDark ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background text-foreground shadow-md"
      >
        <Icon name={isDark ? "moon" : "sun"} size={14} />
      </motion.span>
    </button>
  );
}

export default ThemeSwitch;
