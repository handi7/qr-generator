import type { Metadata } from "next";

import HomePageClient from "./page-client";

export const metadata: Metadata = {
  title: "GaweQR - Custom QR Code Generator",
  description:
    "Create custom QR codes for links, WiFi, WhatsApp, contacts, email, and QRIS. Scan an existing code to restyle it. Everything runs in your browser — nothing is uploaded.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GaweQR - Custom QR Code Generator",
    description:
      "Create custom QR codes for links, WiFi, WhatsApp, contacts, email, and QRIS. Scan an existing code to restyle it. Everything runs in your browser — nothing is uploaded.",
    url: "/",
    siteName: "GaweQR",
    locale: "en_US",
    images: [
      {
        url: "/qr_code.png",
        width: 1868,
        height: 965,
        alt: "GaweQR custom QR code generator preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GaweQR - Custom QR Code Generator",
    description:
      "Create custom QR codes for links, WiFi, WhatsApp, contacts, email, and QRIS. Scan an existing code to restyle it. Everything runs in your browser — nothing is uploaded.",
    images: ["/qr_code.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GaweQR",
  url: "https://gaweqr.my.id",
  description:
    "GaweQR generates custom QR codes in your browser — links, WiFi, WhatsApp, contacts, email, and QRIS. Scan a code to restyle it, save it on your device, and export as PNG, SVG, JPEG, or WEBP.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
