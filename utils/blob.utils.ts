/**
 * `String.fromCharCode(...bytes)` on a whole 2MB logo would blow the argument
 * limit, so the binary string is built in chunks.
 */
const CHUNK_SIZE = 0x8000;

export async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK_SIZE));
  }

  return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

/**
 * Null when the string isn't a base64 data URL. Never throws on bad input — it
 * parses files the user picked off a disk.
 */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  // The payload charset is spelled out rather than using `.` with the `s` flag,
  // which this tsconfig's ES2017 target doesn't allow.
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]*)$/.exec(dataUrl);

  if (!match) return null;

  const [, type, base64] = match;

  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type });
  } catch {
    // atob throws on anything that isn't valid base64.
    return null;
  }
}

/** Hands a generated file to the browser's downloader. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}
