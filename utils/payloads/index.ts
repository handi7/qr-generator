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

/** Every content param any codec owns, so a payload swap can clear all of them. */
const contentParamKeys = [...new Set(Object.values(codecs).flatMap((codec) => codec.paramKeys))];

/**
 * Rewrite the Studio params so they describe `payload` instead of whatever was
 * loaded before.
 *
 * Style params (size, colours, margin) are deliberately kept: someone scanning
 * a QR to restyle it shouldn't lose the design they already set up. Only the
 * content params are cleared, and every codec's are cleared — not just the
 * outgoing one's — so switching e.g. contact → wifi can't leave `full_name`
 * stranded in the URL.
 */
export function paramsForPayload(current: URLSearchParams, payload: string): URLSearchParams {
  const params = new URLSearchParams(current);
  const codec = detectCodec(payload);

  contentParamKeys.forEach((key) => params.delete(key));

  params.set("template", codec.key);

  // The payload is stored exactly as scanned; rebuilding it here could quietly
  // normalise away something the original encoded.
  if (payload) params.set("text", payload);
  else params.delete("text");

  const state = codec.parse(payload);

  if (state) {
    Object.entries(codec.toParams(state)).forEach(([key, value]) => {
      const values = Array.isArray(value) ? value : [value];

      values.filter(Boolean).forEach((item) => params.append(key, item));
    });
  }

  return params;
}

export { contactCodec, emailCodec, textCodec, whatsappCodec, wifiCodec };
