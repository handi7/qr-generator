import type { Metadata } from "next";
import { Suspense } from "react";
import QRStudio from "./page-client";
import QrCode from "./qr";

export const metadata: Metadata = {
  title: "QR Studio - Design and Customize QR Codes",
  description:
    "Design and customize your QR code in GaweQR Studio. Adjust size, style, colors, margins, and content, then download instantly.",
  alternates: {
    canonical: "/studio",
  },
  openGraph: {
    title: "QR Studio - Design and Customize QR Codes | GaweQR",
    description:
      "Design and customize your QR code in GaweQR Studio. Adjust size, style, colors, margins, and content, then download instantly.",
    url: "/studio",
    siteName: "GaweQR",
    locale: "en_US",
    images: [
      {
        url: "/qr_code.png",
        width: 1868,
        height: 965,
        alt: "GaweQR Studio with a customized QR code preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Studio - Design and Customize QR Codes | GaweQR",
    description:
      "Design and customize your QR code in GaweQR Studio. Adjust size, style, colors, margins, and content, then download instantly.",
    images: ["/qr_code.png"],
  },
};

export default function QRStudioPage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* The fallback renders the default QR card server-side, so the h1 and
          card content stay in the static HTML while search params resolve. */}
      <Suspense fallback={<QrCode data="https://gaweqr.my.id" />}>
        <QRStudio />
      </Suspense>
    </div>
  );
}
