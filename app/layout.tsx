import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  keywords: [
    "GaweQR",
    "QR Code Generator",
    "Custom QR Codes",
    "QR Code Maker",
    "WiFi QR Code",
    "WhatsApp QR Code",
    "vCard QR Code",
    "Free QR Code Tool",
  ],
  openGraph: {
    title: "GaweQR - Create Custom QR Codes",
    description:
      "Generate personalized QR codes with flexible styles and templates for links, WiFi, contact cards, WhatsApp, and email.",
    images: ["https://gaweqr.my.id/qr_code.png"],
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
