import type { Metadata } from "next";
import HomePageClient from "./page-client";

export const metadata: Metadata = {
  title: "GaweQR - Custom QR Code Generator",
  description:
    "Create custom QR codes for links, WiFi, WhatsApp, contacts, and email with GaweQR. Design, preview, and download instantly.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GaweQR - Custom QR Code Generator",
    description:
      "Create custom QR codes for links, WiFi, WhatsApp, contacts, and email with GaweQR. Design, preview, and download instantly.",
    url: "/",
    images: ["/qr_code.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GaweQR - Custom QR Code Generator",
    description:
      "Create custom QR codes for links, WiFi, WhatsApp, contacts, and email with GaweQR. Design, preview, and download instantly.",
    images: ["/qr_code.png"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
