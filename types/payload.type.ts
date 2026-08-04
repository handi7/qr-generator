import { TemplateKey } from "./template.type";

/**
 * Query params a codec owns, beyond `text`. An array value becomes a repeated
 * key (`?phone=a&phone=b`).
 */
export type PayloadParams = Record<string, string | string[]>;

/**
 * Everything the app needs to know about one QR payload format.
 *
 * `text` — the encoded payload — stays the single source of truth in the URL.
 * `toParams` / `fromParams` exist only for the formats whose `build()` can
 * return an empty string (a vCard needs a name, a mailto needs a recipient):
 * without them a half-filled form would lose its content on reload.
 */
export interface PayloadCodec<TState> {
  key: TemplateKey;
  /** Blank state for a fresh form. */
  empty: TState;
  /** Payload the Studio starts from when this template is picked. */
  defaultText: string;
  /**
   * Whether `text` looks like this format. Used to route a scanned QR to the
   * right template, so it must not match payloads owned by another codec.
   */
  detect(text: string): boolean;
  /** Payload → form state. Null when `text` isn't this format. */
  parse(text: string): TState | null;
  /** Form state → payload. Empty string when the state has nothing usable. */
  build(state: TState): string;
  /** Every param key this codec owns; all are cleared before a write. */
  paramKeys: readonly string[];
  /** Form state → owned params. Empty when the codec relies on `text` alone. */
  toParams(state: TState): PayloadParams;
  /** Owned params → form state. Null when none of them are present. */
  fromParams(params: URLSearchParams): TState | null;
}

/** A codec whose state type is irrelevant to the caller. */
export type AnyPayloadCodec = PayloadCodec<any>;
