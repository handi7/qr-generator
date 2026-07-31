import { createStore, del, get, set } from "idb-keyval";

/**
 * The logo the Studio is currently using, stored as a `Blob` in IndexedDB.
 *
 * IndexedDB rather than localStorage: a logo has to survive a reload, and
 * base64 in localStorage inflates by a third and competes for a ~5MB quota that
 * is shared with everything else on the origin.
 *
 * A named store, not idb-keyval's default one, so the saved-QR list can share
 * the database later without either feature being able to clobber the other.
 */
const logoStore = createStore("gaweqr", "logos");

/** Only one slot for now; per-QR logos arrive with the saved-QR list. */
const LOGO_KEY = "studio:logo";

/** Beyond this a logo is slowing the QR render down for no visible gain. */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type LogoRejection = "type" | "size";

/** Null when the file is usable, otherwise why it isn't. */
export function rejectLogo(file: File): LogoRejection | null {
  if (!file.type.startsWith("image/")) return "type";
  if (file.size > MAX_LOGO_BYTES) return "size";

  return null;
}

/**
 * Every call below is wrapped: IndexedDB is unavailable in some private-browsing
 * modes and can be switched off entirely. Losing persistence should cost the
 * user the reload, not the logo they just picked.
 */
export async function readLogo(): Promise<Blob | null> {
  try {
    const stored = await get<Blob>(LOGO_KEY, logoStore);

    return stored instanceof Blob ? stored : null;
  } catch {
    return null;
  }
}

/** Whether the logo will still be there after a reload. */
export async function writeLogo(blob: Blob): Promise<boolean> {
  try {
    await set(LOGO_KEY, blob, logoStore);

    return true;
  } catch {
    return false;
  }
}

export async function clearLogo(): Promise<void> {
  try {
    await del(LOGO_KEY, logoStore);
  } catch {
    // Nothing to do — the caller clears the in-memory state regardless.
  }
}
