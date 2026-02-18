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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
