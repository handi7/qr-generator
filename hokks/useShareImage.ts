"use client";

import { addToast } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

export const IMAGE_TYPE = "image/png";

interface ShareImageResult {
  /** Whether this browser can hand a PNG file to a share target. */
  canShareImage: boolean;
  /** Whether this browser can put a PNG on the clipboard. */
  canCopyImage: boolean;
  /** True when the image reached the clipboard. */
  copyBlob: (blob: Blob) => Promise<boolean>;
  /** Shares, falling back to the clipboard and then to a toast. */
  shareBlob: (blob: Blob, filename: string) => Promise<void>;
}

/**
 * The browser-facing half of sharing a PNG: what this browser supports, and
 * how to hand it a blob that already exists.
 *
 * Deliberately knows nothing about where the blob came from. The Studio keeps
 * one eagerly re-rendered from the live QR; the saved list renders one per card
 * on demand. Both need the same capability probe and the same fallback chain.
 */
function useShareImage(): ShareImageResult {
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

  const copyBlob = useCallback(async (blob: Blob) => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ [IMAGE_TYPE]: blob })]);
      addToast({ title: "QR image copied", color: "success" });

      return true;
    } catch {
      return false;
    }
  }, []);

  const shareBlob = useCallback(
    async (blob: Blob, filename: string) => {
      const file = new File([blob], filename, { type: IMAGE_TYPE });

      try {
        await navigator.share({ files: [file], title: file.name });
      } catch (error) {
        // Dismissing the share sheet is a normal outcome, not a failure.
        if (error instanceof Error && error.name === "AbortError") return;

        const copied = await copyBlob(blob);

        if (!copied) {
          addToast({
            title: "Could not share the image",
            description: "Use Download instead.",
            color: "danger",
          });
        }
      }
    },
    [copyBlob],
  );

  return { canShareImage, canCopyImage, copyBlob, shareBlob };
}

export default useShareImage;
