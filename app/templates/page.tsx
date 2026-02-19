import type { Metadata } from "next";
import QRTemplates from "@/app/templates/page-client";

export const metadata: Metadata = {
  title: "QR Code Templates",
  description:
    "Explore ready-to-use QR templates for links, WiFi, WhatsApp, contacts, and email. Start faster with GaweQR templates.",
  alternates: {
    canonical: "/templates",
  },
  openGraph: {
    title: "QR Code Templates - GaweQR",
    description:
      "Explore ready-to-use QR templates for links, WiFi, WhatsApp, contacts, and email. Start faster with GaweQR templates.",
    url: "/templates",
    images: ["/qr_code.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code Templates - GaweQR",
    description:
      "Explore ready-to-use QR templates for links, WiFi, WhatsApp, contacts, and email. Start faster with GaweQR templates.",
    images: ["/qr_code.png"],
  },
};

export default function TemplatesPage() {
  return <QRTemplates />;
}
