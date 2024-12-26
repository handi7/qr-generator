import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider } from "next-themes";
import ConfigurationSection from "./configuration";
import OptionsSection from "./options";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Code Generator - Create Custom QR Codes",
  description:
    "Generate personalized QR codes with ease. Customize shapes, colors, margins, and more to suit your needs. Download in PNG format with the desired filename.",
  keywords: [
    "QR Code Generator",
    "Custom QR Codes",
    "QR Code Maker",
    "Download QR Code",
    "PNG QR Code",
    "Free QR Code Tool",
  ],
  openGraph: {
    title: "QR Code Generator - Create Custom QR Codes",
    description:
      "Generate personalized QR codes with ease. Customize shapes, colors, margins, and more to suit your needs.",
    images: ["https://qr.handiani.my.id/qr_code.png"],
    url: "https://qr.handiani.my.id/",
    type: "website",
  },
  robots: {
    follow: true,
    index: true,
    googleBot: {
      follow: true,
      index: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" enableSystem>
          <NextUIProvider>
            <div className="w-full h-full min-h-[100dvh] flex flex-col items-center">
              <div className="w-full h-full flex justify-center gap-5 px-5">
                <Suspense>
                  <div className="w-60 min-w-60 h-fit overflow-hidden sticky top-0 hidden lg:flex flex-col gap-5 py-5">
                    <ConfigurationSection />
                  </div>
                  {children}
                  <div className="flex-initial sticky top-0 w-60 min-w-60 h-fit max-h-[100dvh] overflow-auto scrollbar-hide hidden lg:flex py-5">
                    <OptionsSection />
                  </div>
                </Suspense>
              </div>
            </div>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
