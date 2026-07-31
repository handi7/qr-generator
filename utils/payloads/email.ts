import { PayloadCodec } from "@/types/payload.type";

export interface EmailState {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

const empty: EmailState = { to: "", cc: "", bcc: "", subject: "", body: "" };

const PREFIX = /^mailto:/i;

function normalizeRecipients(value: string) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean)
    .join(",");
}

const emailCodec: PayloadCodec<EmailState> = {
  key: "email",
  empty,
  // A mailto: without a recipient is meaningless, so the form starts blank.
  defaultText: "",

  detect(text) {
    return PREFIX.test(text.trim());
  },

  parse(text) {
    const trimmed = text.trim();

    if (!PREFIX.test(trimmed)) return null;

    try {
      const url = new URL(trimmed);

      return {
        // Recipients live in the path, not the query, and may be encoded.
        to: normalizeRecipients(decodeURIComponent(url.pathname)),
        cc: normalizeRecipients(url.searchParams.get("cc") ?? ""),
        bcc: normalizeRecipients(url.searchParams.get("bcc") ?? ""),
        subject: url.searchParams.get("subject") ?? "",
        body: url.searchParams.get("body") ?? "",
      };
    } catch {
      return null;
    }
  },

  build(state) {
    const to = normalizeRecipients(state.to);

    if (!to) return "";

    const cc = normalizeRecipients(state.cc);
    const bcc = normalizeRecipients(state.bcc);
    const subject = state.subject.trim();
    const params = new URLSearchParams();

    if (cc) params.set("cc", cc);
    if (bcc) params.set("bcc", bcc);
    if (subject) params.set("subject", subject);
    if (state.body) params.set("body", state.body);

    const query = params.toString();

    return `mailto:${to}${query ? `?${query}` : ""}`;
  },

  // build() returns "" until there is a recipient, so the fields are mirrored
  // into the URL to keep a half-filled form across a reload.
  paramKeys: ["to", "cc", "bcc", "subject", "body"],

  toParams(state) {
    return {
      to: normalizeRecipients(state.to),
      cc: normalizeRecipients(state.cc),
      bcc: normalizeRecipients(state.bcc),
      subject: state.subject,
      body: state.body,
    };
  },

  fromParams(params) {
    const state: EmailState = {
      to: params.get("to") ?? "",
      cc: params.get("cc") ?? "",
      bcc: params.get("bcc") ?? "",
      subject: params.get("subject") ?? "",
      body: params.get("body") ?? "",
    };

    return Object.values(state).some(Boolean) ? state : null;
  },
};

export default emailCodec;
