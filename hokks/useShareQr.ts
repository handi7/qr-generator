"use client";

import { addToast } from "@heroui/react";
import QRCodeStyling from "qr-code-styling";
import { RefObject, useCallback, useRef } from "react";

import useShareImage from "@/hokks/useShareImage";

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
 * Share the QR the Studio is currently rendering.
 *
 * The PNG is regenerated eagerly rather than inside the click handler: Safari
 * treats a long `await` between the click and `navigator.share()` as a loss of
 * user activation and rejects the call, so by the time the button is pressed
 * the blob has to already exist. That eager cache is the whole reason this hook
 * exists on top of `useShareImage`.
 */
function useShareQr(qrCode: RefObject<QRCodeStyling | null>, filename: string): ShareQrResult {
  const { canShareImage, canCopyImage, copyBlob, shareBlob } = useShareImage();

  const blobRef = useRef<Blob | null>(null);
  const revisionRef = useRef(0);

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

    return copyBlob(blob);
  }, [copyBlob]);

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

    // The name is read here, not in prepare(), so the filename field stays live
    // without invalidating the cached blob on every keystroke.
    await shareBlob(blob, `${filename.trim() || "qr"}.png`);
  }, [filename, shareBlob]);

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
