"use client";

import { HeroUIProvider } from "@heroui/system";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import React, { PropsWithChildren } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <HeroUIProvider>
        <MotionConfig reducedMotion="user">
          <Navbar />
          {children}
          <Footer />
        </MotionConfig>
      </HeroUIProvider>
    </ThemeProvider>
  );
}

export default Providers;
