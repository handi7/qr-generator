import { IconName } from "lucide-react/dynamic";

export type TemplateType = "text" | "wifi" | "whatsapp" | "contact" | "email" | "qris";

export type TemplateKey = "text" | "wifi" | "whatsapp" | "contact" | "email" | "qris";

export interface TemplateOption {
  label: string;
  key: TemplateKey;
}

export interface Template {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  accent: string;
  icon: IconName;
  highlights: string[];
  /**
   * Shown in the landing page's shortlist. Opt-in on purpose: the list used to
   * be `templates.slice(0, 4)`, which silently hid every template added past
   * the fourth — Email and QRIS both went live without ever appearing there.
   */
  featured?: boolean;
}
