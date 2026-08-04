import { PayloadCodec } from "@/types/payload.type";

export interface QrisState {
  /** The payload exactly as scanned. This codec never rebuilds it — see `build`. */
  raw: string;
  /** Tag 59. Who actually receives the money; the payer's app shows this too. */
  merchant: string;
  /** Tag 60. */
  city: string;
  /** Tag 54 — present only when the issuer locked an amount into the code. */
  amount: string;
  /** Tag 01 is "12": the amount is fixed and the code is often single-use. */
  isDynamic: boolean;
  /** Whether the tag-63 checksum still matches the payload. */
  isIntact: boolean;
}

const empty: QrisState = {
  raw: "",
  merchant: "",
  city: "",
  amount: "",
  isDynamic: false,
  isIntact: false,
};

/**
 * Tag 63 closes every EMVCo payload and its value is always four characters,
 * so the checksum occupies a fixed-width block at the very end. Locating it by
 * position rather than searching for "6304" matters: those digits can occur
 * inside an earlier value, and `indexOf` would happily split the payload there.
 */
const CRC_TAG = "6304";
const CRC_BLOCK = CRC_TAG.length + 4;

/**
 * CRC-16/CCITT-FALSE (polynomial 0x1021, seed 0xFFFF), computed over the whole
 * payload *including* the literal "6304" that introduces it.
 */
function crc16(input: string): string {
  let crc = 0xffff;

  for (let index = 0; index < input.length; index++) {
    crc ^= input.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Split the trailing checksum off. Null when the payload doesn't end in a
 * well-formed tag 63.
 */
function splitChecksum(payload: string) {
  const start = payload.length - CRC_BLOCK;

  if (start < 0 || payload.slice(start, start + CRC_TAG.length) !== CRC_TAG) return null;

  return {
    // The checksum covers "6304" itself, so the body runs past the tag.
    body: payload.slice(0, start + CRC_TAG.length),
    checksum: payload.slice(start + CRC_TAG.length),
  };
}

/**
 * Walk an EMVCo TLV stream: two digits of tag, two of length, then exactly that
 * many characters of value.
 *
 * Returns null the moment anything fails to line up, and that strictness is the
 * whole point — surviving a full walk is what separates a real payment payload
 * from a string of digits someone happened to type, so `detect` can lean on it
 * instead of a loose prefix match.
 *
 * Nested objects (tags 26–51 carry their own TLV) are left packed: nothing this
 * template renders lives inside them.
 */
function readTlv(input: string): Map<string, string> | null {
  const fields = new Map<string, string>();

  let index = 0;

  while (index < input.length) {
    const tag = input.slice(index, index + 2);
    const rawLength = input.slice(index + 2, index + 4);

    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(rawLength)) return null;

    const length = Number(rawLength);
    const value = input.slice(index + 4, index + 4 + length);

    if (value.length !== length) return null;

    fields.set(tag, value);
    index += 4 + length;
  }

  return fields;
}

const qrisCodec: PayloadCodec<QrisState> = {
  key: "qris",
  empty,

  // Alone among the codecs, this one has nothing to start from: a QRIS is
  // issued by a licensed payment provider and can only arrive here by scan.
  // The form renders its empty state and points at the scanner.
  defaultText: "",

  /**
   * Deliberately does *not* require a valid checksum. A payload that looks like
   * QRIS but fails CRC is almost always a hand-edited `text` param, and routing
   * it here so the form can say so beats letting it pass silently as free text.
   */
  detect(text) {
    const payload = text.trim();

    if (!payload.startsWith("000201")) return false;
    if (!splitChecksum(payload)) return false;

    const fields = readTlv(payload);

    if (!fields) return false;

    // Format indicator, Indonesia, and a merchant name — all mandatory, and
    // together specific enough that no ordinary payload reaches this line.
    return fields.get("00") === "01" && fields.get("58") === "ID" && fields.has("59");
  },

  parse(text) {
    const payload = text.trim();
    const fields = readTlv(payload);
    const parts = splitChecksum(payload);

    if (!fields || !parts) return null;

    return {
      raw: payload,
      merchant: fields.get("59") ?? "",
      city: fields.get("60") ?? "",
      amount: fields.get("54") ?? "",
      isDynamic: fields.get("01") === "12",
      isIntact: crc16(parts.body) === parts.checksum.toUpperCase(),
    };
  },

  /**
   * Verbatim, always — the one codec that inverts the usual contract.
   *
   * Everywhere else `build` composes a payload from form state. Here it must
   * not: the tag-63 checksum seals the payload, so re-serialising it at all —
   * reordering a field, trimming a value, normalising a case — breaks it. There
   * is no state to compose from anyway, because the form is read-only.
   */
  build: (state) => state.raw,

  // `text` carries the payload whole, so there is nothing to mirror into params.
  paramKeys: [],
  toParams: () => ({}),
  fromParams: () => null,
};

export default qrisCodec;
