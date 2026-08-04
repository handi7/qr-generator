import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";

import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gaweqr.my.id"),
  title: {
    default: "GaweQR - Create Custom QR Codes",
    template: "%s | GaweQR",
  },
  description:
    "GaweQR helps you generate custom QR codes fast. Design links, WiFi, WhatsApp, contact, and email QR codes, then download in PNG, SVG, JPEG, or WEBP.",
  applicationName: "GaweQR",
  openGraph: {
    title: "GaweQR - Create Custom QR Codes",
    description:
      "Generate personalized QR codes with flexible styles and templates for links, WiFi, contact cards, WhatsApp, and email.",
    images: [
      {
        url: "/qr_code.png",
        width: 1868,
        height: 965,
        alt: "GaweQR custom QR code generator preview",
      },
    ],
    url: "https://gaweqr.my.id",
    siteName: "GaweQR",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GaweQR - Create Custom QR Codes",
    description:
      "Generate personalized QR codes with flexible styles and templates for links, WiFi, contact cards, WhatsApp, and email.",
    images: ["https://gaweqr.my.id/qr_code.png"],
  },
  alternates: {
    canonical: "https://gaweqr.my.id",
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
    <html lang="en" suppressHydrationWarning className="bg-background text-foreground">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
