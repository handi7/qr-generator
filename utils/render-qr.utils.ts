import QRCodeStyling from "qr-code-styling";

import { readLogoAt } from "./logo.utils";
import { dataFromParams, exportSizeFromParams, optionsFromParams } from "./qr-options.utils";
import { SavedQr } from "./saved-qr.utils";

/**
 * Render a saved record to a full-size PNG off a throwaway instance.
 *
 * The list keeps no live `QRCodeStyling` per card — the stored thumbnail exists
 * precisely so it doesn't have to — so anything that needs real pixels rebuilds
 * them here. The thumbnail is no substitute: at 120px a dense payload lands
 * under two pixels per module and won't scan.
 *
 * Rendered at the record's own export size, so what gets shared matches what
 * Download in the Studio would produce.
 */
export async function renderRecordPng(record: SavedQr): Promise<Blob | null> {
  const params = new URLSearchParams(record.params);
  const data = dataFromParams(params);

  // An empty payload is a real state — a QRIS or email record saved before its
  // content was filled in — and QRCodeStyling throws on it.
  if (!data) return null;

  const logo = record.logoKey ? await readLogoAt(record.logoKey) : null;
  const logoUrl = logo ? URL.createObjectURL(logo) : "";

  try {
    const size = exportSizeFromParams(params);
    const qr = new QRCodeStyling({
      ...optionsFromParams(params, logoUrl),
      data,
      width: size,
      height: size,
    });

    const raw = await qr.getRawData("png");

    return raw instanceof Blob ? raw : null;
  } catch {
    return null;
  } finally {
    // Safe here rather than earlier: getRawData resolves only once the logo has
    // been loaded and drawn into the canvas.
    if (logoUrl) URL.revokeObjectURL(logoUrl);
  }
}

/** Strips what a filesystem won't take, so a record name can be a filename. */
export function filenameFor(name: string): string {
  const safe = name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    // Without this, a name made entirely of illegal characters collapses to a
    // bare "-", which is truthy and would slip past the fallback below.
    .replace(/^-+|-+$/g, "");

  return `${safe || "qr"}.png`;
}
