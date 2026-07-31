/**
 * Decode a QR code out of an image the user supplied — a file, a drop, or a
 * clipboard paste.
 *
 * Two paths: the browser's own `BarcodeDetector` where it exists (Chrome and
 * Android, hardware-accelerated), and a lazily loaded jsQR everywhere else
 * (Safari, Firefox). The import is dynamic on purpose — most visitors never
 * scan, so the decoder should stay out of the Studio bundle.
 */

/** Photos off a phone camera are far larger than a decoder needs. */
const MAX_EDGE = 1600;

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
}

/**
 * Read off `window` rather than declaring a global: the API isn't in TypeScript's
 * DOM lib, and an ambient declaration would imply it always exists.
 */
function getBarcodeDetector(): BarcodeDetectorConstructor | null {
  const candidate = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;

  return typeof candidate === "function" ? candidate : null;
}

async function decodeWithBarcodeDetector(bitmap: ImageBitmap): Promise<string | null> {
  const BarcodeDetector = getBarcodeDetector();

  if (!BarcodeDetector) return null;

  try {
    // Chrome on some Linux builds exposes the constructor without shipping the
    // QR format, so the claim has to be checked rather than trusted.
    const formats = (await BarcodeDetector.getSupportedFormats?.()) ?? ["qr_code"];

    if (!formats.includes("qr_code")) return null;

    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const found = await detector.detect(bitmap);

    return found[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}

async function decodeWithJsQr(bitmap: ImageBitmap): Promise<string | null> {
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) return null;

  context.drawImage(bitmap, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const { default: jsQR } = await import("jsqr");

  // Light-on-dark QR codes are common on posters and dark-mode screenshots.
  return jsQR(data, width, height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

/** The decoded payload, or null when the image holds no readable QR code. */
export async function decodeQrImage(source: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(source);

  try {
    return (await decodeWithBarcodeDetector(bitmap)) ?? (await decodeWithJsQr(bitmap));
  } finally {
    bitmap.close();
  }
}

/** Pull the first image out of a drop or paste, ignoring non-image payloads. */
export function findImageFile(list: FileList | null | undefined): File | null {
  if (!list) return null;

  return Array.from(list).find((file) => file.type.startsWith("image/")) ?? null;
}
