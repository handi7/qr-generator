import { PayloadCodec } from "@/types/payload.type";

export interface WhatsappState {
  phone: string;
  message: string;
}

const empty: WhatsappState = { phone: "", message: "" };

/** Both hosts WhatsApp itself hands out for click-to-chat links. */
const HOSTS = ["wa.me", "api.whatsapp.com", "web.whatsapp.com"];

function toUrl(text: string): URL | null {
  try {
    const url = new URL(text.trim());

    if (!HOSTS.some((host) => url.hostname === host || url.hostname === `www.${host}`)) return null;

    return url;
  } catch {
    return null;
  }
}

const whatsappCodec: PayloadCodec<WhatsappState> = {
  key: "whatsapp",
  empty,
  defaultText: "https://wa.me/628?text=Halo%20boleh%20tanya%3F",

  detect(text) {
    return !!toUrl(text);
  },

  parse(text) {
    const url = toUrl(text);

    if (!url) return null;

    // wa.me carries the number in the path; api/web.whatsapp.com use
    // /send?phone=. Keeping only digits is what tells the two apart — the
    // literal "send" path segment reduces to nothing.
    const fromPath = url.pathname.replace(/\D/g, "");
    const fromQuery = (url.searchParams.get("phone") ?? "").replace(/\D/g, "");

    return {
      phone: fromPath || fromQuery,
      message: url.searchParams.get("text") ?? "",
    };
  },

  build(state) {
    const phone = state.phone.replace(/[^\d]/g, "");
    const base = `https://wa.me/${phone}`;

    return state.message ? `${base}?text=${encodeURIComponent(state.message)}` : base;
  },

  // A chat link is never empty, so `text` alone preserves a half-filled form.
  paramKeys: [],
  toParams: () => ({}),
  fromParams: () => null,
};

export default whatsappCodec;
