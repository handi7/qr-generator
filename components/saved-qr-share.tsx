"use client";

import { Button, addToast } from "@heroui/react";
import { Copy, Link2, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import useShareImage from "@/hokks/useShareImage";
import { filenameFor, renderRecordPng } from "@/utils/render-qr.utils";
import { SavedQr } from "@/utils/saved-qr.utils";

interface Props {
  record: SavedQr;
}

/**
 * Share actions for one saved code.
 *
 * The Studio can cache its PNG eagerly because it has exactly one live QR. A
 * list can't: pre-rendering every card would undo the reason thumbnails exist.
 * So the render is deferred, and instead primed the moment the pointer or focus
 * reaches the button — usually well before the click lands. The blob is cached
 * per record, so a second share is instant either way.
 */
function SavedQrShare({ record }: Props) {
  const { canShareImage, canCopyImage, copyBlob, shareBlob } = useShareImage();

  const [isBusy, setIsBusy] = useState(false);

  const blobRef = useRef<Blob | null>(null);
  const pendingRef = useRef<Promise<Blob | null> | null>(null);

  // A rename doesn't change the pixels, but anything else about the record does.
  useEffect(() => {
    blobRef.current = null;
    pendingRef.current = null;
  }, [record.params, record.logoKey, record.updatedAt]);

  /** Renders at most once per record; concurrent callers await the same promise. */
  const load = useCallback(() => {
    if (blobRef.current) return Promise.resolve(blobRef.current);

    pendingRef.current ??= renderRecordPng(record).then((blob) => {
      blobRef.current = blob;

      return blob;
    });

    return pendingRef.current;
  }, [record]);

  const run = useCallback(
    async (action: (blob: Blob) => Promise<unknown>) => {
      setIsBusy(true);

      try {
        const blob = await load();

        if (!blob) {
          addToast({
            title: "Couldn't render this code",
            description: "Open it in Studio to check its content.",
            color: "danger",
          });

          return;
        }

        await action(blob);
      } finally {
        setIsBusy(false);
      }
    },
    [load],
  );

  const copyLink = useCallback(async () => {
    try {
      const url = new URL(`/studio?${record.params}`, window.location.origin);

      // Records shouldn't carry an `id` — it names this browser's copy, and the
      // recipient has nothing under that key — but an imported file might.
      url.searchParams.delete("id");

      await navigator.clipboard.writeText(url.toString());
      addToast({
        title: "Link copied",
        description: record.logoKey
          ? "Opens in Studio — but without the logo, which can't be encoded in a URL."
          : "Opens this QR in Studio, ready to edit.",
        color: "success",
      });
    } catch {
      addToast({ title: "Could not copy the link", color: "danger" });
    }
  }, [record.logoKey, record.params]);

  const prime = useCallback(() => void load(), [load]);

  return (
    <>
      {(canShareImage || canCopyImage) && (
        // `display: contents` so the wrapper carries the priming handlers
        // without taking part in the layout. They sit here rather than on the
        // Button because HeroUI routes interaction through react-aria, which
        // doesn't forward raw pointer events.
        <div className="contents" onFocusCapture={prime} onPointerEnter={prime}>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            isLoading={isBusy}
            aria-label={canShareImage ? `Share ${record.name}` : `Copy ${record.name} as image`}
            onPress={() =>
              void run((blob) =>
                canShareImage ? shareBlob(blob, filenameFor(record.name)) : copyBlob(blob),
              )
            }
          >
            {!isBusy && (canShareImage ? <Share2 size={14} /> : <Copy size={14} />)}
          </Button>
        </div>
      )}

      <Button
        isIconOnly
        size="sm"
        variant="flat"
        aria-label={`Copy link to ${record.name}`}
        onPress={() => void copyLink()}
      >
        <Link2 size={14} />
      </Button>
    </>
  );
}

export default SavedQrShare;
