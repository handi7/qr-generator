"use client";

import { addToast } from "@heroui/react";
import QRCodeStyling from "qr-code-styling";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

const IMAGE_TYPE = "image/png";

interface ShareQrResult {
  /** Whether this browser can hand a PNG file to a share target. */
  canShareImage: boolean;
  /** Whether this browser can put a PNG on the clipboard. */
  canCopyImage: boolean;
  /** Re-render the cached PNG. Call it whenever the QR changes. */
  prepare: () => void;
  shareImage: () => Promise<void>;
  copyImage: () => Promise<boolean>;
  copyLink: () => Promise<void>;
}

/**
 * Share the rendered QR without going through a file download.
 *
 * The PNG is regenerated eagerly rather than inside the click handler: Safari
 * treats a long `await` between the click and `navigator.share()` as a loss of
 * user activation and rejects the call, so by the time the button is pressed
 * the blob has to already exist.
 */
function useShareQr(qrCode: RefObject<QRCodeStyling | null>, filename: string): ShareQrResult {
  const blobRef = useRef<Blob | null>(null);
  const revisionRef = useRef(0);

  const [canShareImage, setCanShareImage] = useState(false);
  const [canCopyImage, setCanCopyImage] = useState(false);

  useEffect(() => {
    // Probe after mount, never while rendering: `navigator` does not exist
    // during SSR, and branching on it would desync hydration. Web Share only
    // reports file support for a concrete file, so hand it a throwaway one.
    const probe = new File([new Uint8Array(1)], "probe.png", { type: IMAGE_TYPE });

    setCanShareImage(!!navigator.share && !!navigator.canShare?.({ files: [probe] }));
    setCanCopyImage(typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write);
  }, []);

  const prepare = useCallback(() => {
    const revision = ++revisionRef.current;

    blobRef.current = null;

    void qrCode.current
      ?.getRawData("png")
      .then((raw) => {
        // A newer prepare() started while this one was pending; that one wins.
        if (revision !== revisionRef.current) return;

        blobRef.current = raw instanceof Blob ? raw : null;
      })
      .catch(() => {
        if (revision !== revisionRef.current) return;

        blobRef.current = null;
      });
  }, [qrCode]);

  const copyImage = useCallback(async () => {
    const blob = blobRef.current;

    if (!blob) return false;

    try {
      await navigator.clipboard.write([new ClipboardItem({ [IMAGE_TYPE]: blob })]);
      addToast({ title: "QR image copied", color: "success" });

      return true;
    } catch {
      return false;
    }
  }, []);

  const shareImage = useCallback(async () => {
    const blob = blobRef.current;

    if (!blob) {
      addToast({
        title: "The QR is still rendering",
        description: "Give it a moment and try again.",
        color: "warning",
      });

      return;
    }

    // Built here, not in prepare(), so the filename field stays live without
    // invalidating the cached blob on every keystroke.
    const file = new File([blob], `${filename.trim() || "qr"}.png`, { type: IMAGE_TYPE });

    try {
      await navigator.share({ files: [file], title: file.name });
    } catch (error) {
      // Dismissing the share sheet is a normal outcome, not a failure.
      if (error instanceof Error && error.name === "AbortError") return;

      const copied = await copyImage();

      if (!copied) {
        addToast({
          title: "Could not share the image",
          description: "Use Download instead.",
          color: "danger",
        });
      }
    }
  }, [filename, copyImage]);

  const copyLink = useCallback(async () => {
    try {
      const url = new URL(window.location.href);

      // `id` names a record in this browser's storage. Sending it on would point
      // the recipient at something that doesn't exist on their device.
      url.searchParams.delete("id");

      await navigator.clipboard.writeText(url.toString());
      addToast({
        title: "Link copied",
        description: "Opens this QR in Studio, ready to edit.",
        color: "success",
      });
    } catch {
      addToast({ title: "Could not copy the link", color: "danger" });
    }
  }, []);

  return { canShareImage, canCopyImage, prepare, shareImage, copyImage, copyLink };
}

export default useShareQr;
