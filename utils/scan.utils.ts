/**
 * Decode a QR code out of an image the user supplied — a file, a drop, a
 * clipboard paste — or out of a live camera frame.
 *
 * Two decoders: the browser's own `BarcodeDetector` where it exists (Chrome and
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

interface Frame {
  source: CanvasImageSource & ImageBitmapSource;
  width: number;
  height: number;
}

/**
 * Read off `window` rather than declaring a global: the API isn't in TypeScript's
 * DOM lib, and an ambient declaration would imply it always exists.
 */
function getConstructor(): BarcodeDetectorConstructor | null {
  const candidate = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
    .BarcodeDetector;

  return typeof candidate === "function" ? candidate : null;
}

let detectorPromise: Promise<BarcodeDetectorInstance | null> | undefined;

/** Probed and built once — the camera loop calls this many times a second. */
function getDetector(): Promise<BarcodeDetectorInstance | null> {
  detectorPromise ??= (async () => {
    const BarcodeDetector = getConstructor();

    if (!BarcodeDetector) return null;

    try {
      // Chrome on some Linux builds exposes the constructor without shipping the
      // QR format, so the claim has to be checked rather than trusted.
      const formats = (await BarcodeDetector.getSupportedFormats?.()) ?? ["qr_code"];

      if (!formats.includes("qr_code")) return null;

      return new BarcodeDetector({ formats: ["qr_code"] });
    } catch {
      return null;
    }
  })();

  return detectorPromise;
}

let frameCanvas: HTMLCanvasElement | undefined;

/**
 * The camera loop reuses one canvas — allocating several times a second thrashes
 * the GC. One-off image decodes get their own, so a paste arriving mid-scan can't
 * overwrite the pixels the other decode is about to read.
 */
function getFrameCanvas(): HTMLCanvasElement {
  frameCanvas ??= document.createElement("canvas");

  return frameCanvas;
}

async function decodeWithDetector(source: ImageBitmapSource): Promise<string | null> {
  const detector = await getDetector();

  if (!detector) return null;

  try {
    const found = await detector.detect(source);

    return found[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}

async function decodeWithJsQr(frame: Frame, canvas: HTMLCanvasElement): Promise<string | null> {
  const scale = Math.min(1, MAX_EDGE / Math.max(frame.width, frame.height));
  const width = Math.max(1, Math.round(frame.width * scale));
  const height = Math.max(1, Math.round(frame.height * scale));

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) return null;

  context.drawImage(frame.source, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const { default: jsQR } = await import("jsqr");

  // Light-on-dark QR codes are common on posters and dark-mode screenshots.
  return jsQR(data, width, height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

async function decodeFrame(frame: Frame, canvas: HTMLCanvasElement): Promise<string | null> {
  return (await decodeWithDetector(frame.source)) ?? (await decodeWithJsQr(frame, canvas));
}

/** The decoded payload, or null when the image holds no readable QR code. */
export async function decodeQrImage(source: Blob): Promise<string | null> {
  const bitmap = await createImageBitmap(source);

  try {
    return await decodeFrame(
      { source: bitmap, width: bitmap.width, height: bitmap.height },
      document.createElement("canvas"),
    );
  } finally {
    bitmap.close();
  }
}

/** Decode whatever the camera is showing right now. */
export async function decodeQrVideoFrame(video: HTMLVideoElement): Promise<string | null> {
  // Early frames arrive before the stream reports its dimensions.
  if (!video.videoWidth || !video.videoHeight) return null;

  return decodeFrame(
    { source: video, width: video.videoWidth, height: video.videoHeight },
    getFrameCanvas(),
  );
}

/** Pull the first image out of a drop or paste, ignoring non-image payloads. */
export function findImageFile(list: FileList | null | undefined): File | null {
  if (!list) return null;

  return Array.from(list).find((file) => file.type.startsWith("image/")) ?? null;
}

/**
 * Whether offering the camera makes sense. getUserMedia is gated on a secure
 * context, so on plain http the button would only ever produce an error.
 */
export function isCameraSupported(): boolean {
  return !!navigator.mediaDevices?.getUserMedia && window.isSecureContext;
}

export function startCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    // `ideal`, not `exact`: laptops only have a front camera and would
    // otherwise fail outright instead of falling back.
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  });
}

/** Releases the camera. Without this the indicator light stays on. */
export function stopCamera(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function describeCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";

  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was blocked. Allow it in your browser's site settings, then try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera found on this device.";
    case "NotReadableError":
      return "The camera is already in use by another app.";
    default:
      return "The camera couldn't be started.";
  }
}
