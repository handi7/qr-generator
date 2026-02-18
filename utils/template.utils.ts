import { templateOptions } from "@/constants/template.data";
import { TemplateKey, TemplateType } from "@/types/template.type";

export function normalizeTemplateType(value?: string): TemplateType {
  const templateKeys = templateOptions.map((item) => item.key);

  if (!value || !templateKeys.includes(value as TemplateKey)) return "text";

  return value as TemplateType;
}
