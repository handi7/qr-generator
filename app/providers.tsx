"use client";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider } from "next-themes";
import React, { PropsWithChildren } from "react";
import Navbar from "@/components/Navbar";

function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <HeroUIProvider>
        <Navbar />
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default Providers;
