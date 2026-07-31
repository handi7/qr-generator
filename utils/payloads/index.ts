import contactCodec from "./contact";
import emailCodec from "./email";
import textCodec from "./text";
import whatsappCodec from "./whatsapp";
import wifiCodec from "./wifi";

import { AnyPayloadCodec } from "@/types/payload.type";
import { TemplateKey } from "@/types/template.type";

export const codecs: Record<TemplateKey, AnyPayloadCodec> = {
  text: textCodec,
  wifi: wifiCodec,
  whatsapp: whatsappCodec,
  contact: contactCodec,
  email: emailCodec,
};

/**
 * Most specific first. `wifi`, `contact` and `email` are keyed off a scheme or
 * marker so they can't collide; `whatsapp` only claims known WhatsApp hosts,
 * which keeps every other URL falling through to `text`.
 */
const DETECTION_ORDER: AnyPayloadCodec[] = [
  wifiCodec,
  contactCodec,
  emailCodec,
  whatsappCodec,
  textCodec,
];

/** Pick the codec for a payload — a scanned QR, or a `text` param from a link. */
export function detectCodec(text: string): AnyPayloadCodec {
  return DETECTION_ORDER.find((codec) => codec.detect(text)) ?? textCodec;
}

export { contactCodec, emailCodec, textCodec, whatsappCodec, wifiCodec };
