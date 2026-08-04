import { createStore, del, get, set } from "idb-keyval";

/**
 * Logos, stored as `Blob`s in IndexedDB.
 *
 * IndexedDB rather than localStorage: a logo has to survive a reload, and
 * base64 in localStorage inflates by a third and competes for a ~5MB quota that
 * is shared with everything else on the origin.
 *
 * One database per object store, which is the only shape idb-keyval supports —
 * it opens without a version, so `onupgradeneeded` never fires for an existing
 * database and a second store would silently not exist.
 */
const logoStore = createStore("gaweqr", "logos");

/** The logo the Studio is currently showing. Saved codes get their own keys. */
const STUDIO_KEY = "studio:logo";

/** Beyond this a logo is slowing the QR render down for no visible gain. */
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type LogoRejection = "type" | "size";

/** Null when the file is usable, otherwise why it isn't. */
export function rejectLogo(file: File): LogoRejection | null {
  if (!file.type.startsWith("image/")) return "type";
  if (file.size > MAX_LOGO_BYTES) return "size";

  return null;
}

/** Where a saved code's own copy of a logo lives. */
export function logoKeyFor(id: string): string {
  return `code:${id}`;
}

/**
 * Every call below is wrapped: IndexedDB is unavailable in some private-browsing
 * modes and can be switched off entirely. Losing persistence should cost the
 * user the reload, not the logo they just picked.
 */
export async function readLogoAt(key: string): Promise<Blob | null> {
  try {
    const stored = await get<Blob>(key, logoStore);

    return stored instanceof Blob ? stored : null;
  } catch {
    return null;
  }
}

/** Whether the logo will still be there after a reload. */
export async function writeLogoAt(key: string, blob: Blob): Promise<boolean> {
  try {
    await set(key, blob, logoStore);

    return true;
  } catch {
    return false;
  }
}

export async function deleteLogoAt(key: string): Promise<void> {
  try {
    await del(key, logoStore);
  } catch {
    // Nothing to do — the caller clears the in-memory state regardless.
  }
}

export function readLogo(): Promise<Blob | null> {
  return readLogoAt(STUDIO_KEY);
}

export function writeLogo(blob: Blob): Promise<boolean> {
  return writeLogoAt(STUDIO_KEY, blob);
}

export function clearLogo(): Promise<void> {
  return deleteLogoAt(STUDIO_KEY);
}

/**
 * Give a saved code its own copy of the current logo rather than a reference to
 * the Studio slot — otherwise picking a new logo later would silently restyle
 * every saved code that used the old one.
 */
export async function copyStudioLogoTo(key: string): Promise<boolean> {
  const blob = await readLogo();

  if (!blob) return false;

  return writeLogoAt(key, blob);
}
