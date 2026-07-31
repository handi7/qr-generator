import { createStore, del, get, set, values } from "idb-keyval";

import { deleteLogoAt, logoKeyFor } from "./logo.utils";

import { TemplateKey } from "@/types/template.type";

/**
 * Saved QR codes, on this device only.
 *
 * Its own database, not another store inside `gaweqr`: idb-keyval opens without
 * a version, so `onupgradeneeded` never fires for a database that already
 * exists and a second object store would just be missing — every write failing
 * with NotFoundError behind the try/catch below.
 */
const codeStore = createStore("gaweqr-codes", "codes");

export interface SavedQr {
  id: string;
  name: string;
  template: TemplateKey;
  /** The Studio query string, `id` excluded — it is this record's own key. */
  params: string;
  /** Key in the logo store; absent when the code has no logo. */
  logoKey?: string;
  /** Small PNG data URL. A URL, not a Blob, so the list needs no object URLs. */
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * `crypto.randomUUID` only exists in a secure context, and the dev server is
 * reachable over plain http on the LAN.
 */
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Newest first. Empty when storage is unavailable. */
export async function listSavedQrs(): Promise<SavedQr[]> {
  try {
    const stored = await values<SavedQr>(codeStore);

    return stored.filter((record) => !!record?.id).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function readSavedQr(id: string): Promise<SavedQr | null> {
  try {
    return (await get<SavedQr>(id, codeStore)) ?? null;
  } catch {
    return null;
  }
}

/** Whether the record actually landed on disk. */
export async function writeSavedQr(record: SavedQr): Promise<boolean> {
  try {
    await set(record.id, record, codeStore);

    return true;
  } catch {
    return false;
  }
}

/** Removes the record and the logo copy it owned. */
export async function deleteSavedQr(id: string): Promise<void> {
  try {
    await del(id, codeStore);
  } catch {
    // Ignored: reporting a failed delete helps nobody, and the list refreshes.
  }

  await deleteLogoAt(logoKeyFor(id));
}
