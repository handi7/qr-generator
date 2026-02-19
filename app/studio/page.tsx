import type { Metadata } from "next";
import QRStudio from "./page-client";

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
    images: ["/qr_code.png"],
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
  return <QRStudio />;
}
