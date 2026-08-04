import { PayloadCodec } from "@/types/payload.type";

export interface WifiState {
  type: string;
  ssid: string;
  password: string;
  /** Kept so scanning a hidden-network QR and restyling it doesn't drop `H:`. */
  hidden: boolean;
}

const empty: WifiState = { type: "WPA", ssid: "", password: "", hidden: false };

const PREFIX = /^WIFI:/i;

/** Per the WIFI: scheme, these five characters must be backslash-escaped. */
const RESERVED = /([\\;:,"])/g;

function escape(value: string) {
  return value.replace(RESERVED, "\\$1");
}

/**
 * Split `T:WPA;S:my;net;P:pass;;` into its fields.
 *
 * Hand-rolled rather than a regex because the separators can themselves appear
 * escaped inside a value, and because real-world generators emit the fields in
 * whatever order they like — an SSID-first payload has to parse the same.
 */
function readFields(body: string): Map<string, string> {
  const fields = new Map<string, string>();

  let key = "";
  let value = "";
  let readingKey = true;
  let escaped = false;

  const commit = () => {
    if (key) fields.set(key.toUpperCase(), value);
    key = "";
    value = "";
    readingKey = true;
  };

  for (const char of body) {
    if (escaped) {
      if (readingKey) key += char;
      else value += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (readingKey && char === ":") {
      readingKey = false;
      continue;
    }

    if (char === ";") {
      commit();
      continue;
    }

    if (readingKey) key += char;
    else value += char;
  }

  commit();

  return fields;
}

const wifiCodec: PayloadCodec<WifiState> = {
  key: "wifi",
  empty,
  defaultText: "WIFI:T:WPA;S:Wifi Name;P:Wifi Password;;",

  detect(text) {
    return PREFIX.test(text.trim());
  },

  parse(text) {
    const trimmed = text.trim();

    if (!PREFIX.test(trimmed)) return null;

    const fields = readFields(trimmed.slice("WIFI:".length));
    const rawType = fields.get("T") ?? "";

    return {
      // `nopass` is the spec's way of saying "open network"; the form models
      // that as an empty selection.
      type: rawType.toLowerCase() === "nopass" ? "" : rawType,
      ssid: fields.get("S") ?? "",
      password: fields.get("P") ?? "",
      hidden: (fields.get("H") ?? "").toLowerCase() === "true",
    };
  },

  build(state) {
    const parts = [
      `T:${escape(state.type)}`,
      `S:${escape(state.ssid)}`,
      `P:${escape(state.password)}`,
    ];

    if (state.hidden) parts.push("H:true");

    return `WIFI:${parts.join(";")};;`;
  },

  // A WiFi payload is never empty, so `text` alone preserves a half-filled form.
  paramKeys: [],
  toParams: () => ({}),
  fromParams: () => null,
};

export default wifiCodec;
