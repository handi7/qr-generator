import type { Metadata } from "next";

import SavedQrList from "@/app/my-qr/page-client";

export const metadata: Metadata = {
  title: "My QR Codes",
  description:
    "Your saved QR codes, stored on this device only. Reopen one in GaweQR Studio to edit, restyle, or download it again.",
  alternates: {
    canonical: "/my-qr",
  },
  // The page only ever shows data from the visitor's own browser, so there is
  // nothing here for a crawler to index.
  robots: {
    index: false,
    follow: true,
  },
};

export default function MyQrPage() {
  return <SavedQrList />;
}
