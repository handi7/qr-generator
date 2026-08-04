import { Template, TemplateOption } from "@/types/template.type";

// Starting payloads live on each codec's `defaultText`, not here, so a template
// has exactly one place that owns its format.
export const templateOptions: TemplateOption[] = [
  { label: "Free Text", key: "text" },
  { label: "Wifi", key: "wifi" },
  { label: "Whatsapp", key: "whatsapp" },
  { label: "Contact (vCard)", key: "contact" },
  { label: "Email", key: "email" },
  { label: "QRIS (scan to restyle)", key: "qris" },
];

export const templates: Template[] = [
  {
    title: "Free Text",
    subtitle: "Universal",
    description: "Create a QR code from any URL or custom text for campaigns, docs, and labels.",
    href: "/studio?template=text",
    accent: "from-primary/20 via-sky-400/15 to-emerald-300/10",
    icon: "link-2",
    highlights: ["Instant setup", "Works everywhere", "Great for links"],
  },
  {
    title: "WiFi",
    subtitle: "Hospitality",
    description:
      "Let people connect to your network by scanning once instead of typing credentials.",
    href: "/studio?template=wifi",
    accent: "from-sky-500/20 via-cyan-400/15 to-primary/10",
    icon: "wifi",
    highlights: ["Faster check-in", "Fewer support asks", "Event-friendly"],
  },
  {
    title: "WhatsApp",
    subtitle: "Conversion",
    description: "Open a WhatsApp chat with prefilled text to speed up inquiries and sales.",
    href: "/studio?template=whatsapp",
    accent: "from-emerald-500/20 via-green-400/15 to-teal-300/10",
    icon: "message-circle",
    highlights: ["Prefilled message", "Higher engagement", "Simple CTA"],
  },
  {
    title: "Contact vCard",
    subtitle: "Networking",
    description:
      "Share complete contact details in one scan, including multiple phones and emails.",
    href: "/studio?template=contact",
    accent: "from-violet-500/20 via-indigo-400/15 to-sky-300/10",
    icon: "contact",
    highlights: ["Rich profile", "Mobile-friendly", "Save to contacts"],
  },
  {
    title: "Email",
    subtitle: "Communication",
    description: "Send pre-filled email via QR with recipients, subject, and multiline body.",
    href: "/studio?template=email",
    accent: "from-amber-400/20 via-orange-400/15 to-rose-300/10",
    icon: "mail",
    highlights: ["Mailto ready", "Shareable URL", "Body supported"],
  },
  {
    title: "QRIS",
    subtitle: "Payments",
    description:
      "Scan your existing QRIS to restyle it for a standee or menu. The payload is reused untouched — it is never generated here.",
    href: "/studio?template=qris",
    accent: "from-rose-500/20 via-red-400/15 to-orange-300/10",
    icon: "wallet",
    highlights: ["Scan to load", "Payload untouched", "Merchant shown"],
  },
];
