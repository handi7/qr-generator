import { IconName } from "lucide-react/dynamic";

export type TemplateType = "text" | "wifi" | "whatsapp" | "contact" | "email";

export type TemplateKey = "text" | "wifi" | "whatsapp" | "contact" | "email";

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
}
