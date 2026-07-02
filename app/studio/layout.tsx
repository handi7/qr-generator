import { Divider } from "@heroui/react";
import React, { PropsWithChildren, Suspense } from "react";
import ConfigurationSection from "./configuration";
import OptionsSection from "./options";

const panelFallback = (
  <div className="h-64 w-full animate-pulse rounded-3xl border border-foreground/10 bg-content1/60" />
);

function QRStudioLayout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col items-center gap-5 px-4 py-6 sm:px-6 xl:flex-row xl:items-start xl:justify-center">
        <div className="order-1 w-full xl:order-2 xl:flex xl:max-w-[740px] xl:justify-center">
          {children}
        </div>

        <Divider className="order-2 xl:hidden" />

        <div className="order-3 w-full xl:order-1 xl:w-[360px] xl:min-w-[360px] xl:sticky xl:top-20">
          <Suspense fallback={panelFallback}>
            <ConfigurationSection />
          </Suspense>
        </div>

        <div className="order-4 w-full xl:order-3 xl:w-[360px] xl:min-w-[360px] xl:sticky xl:top-10 xl:max-h-[calc(100dvh-6rem)] xl:overflow-auto scrollbar-hide">
          <Suspense fallback={panelFallback}>
            <OptionsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default QRStudioLayout;
