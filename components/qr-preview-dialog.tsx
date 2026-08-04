"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useMemo, useRef, useState } from "react";

import LinkOrText from "@/components/link-or-text";
import { templateOptions } from "@/constants/template.data";
import { readLogoAt } from "@/utils/logo.utils";
import { dataFromParams, exportSizeFromParams, optionsFromParams } from "@/utils/qr-options.utils";
import { SavedQr } from "@/utils/saved-qr.utils";

/** Display size only. The record's own size is shown as a caption instead. */
const PREVIEW_SIZE = 260;

interface Props {
  /** The record to preview, or null when nothing is open. */
  record: SavedQr | null;
  onClose: () => void;
  onOpenInStudio: (record: SavedQr) => void;
}

/**
 * The record's own logo copy, as an object URL.
 *
 * Returns `isPending` so the caller can hold the render back: painting a
 * logo-less QR for a beat and then swapping the logo in makes the preview look
 * like it changed the design.
 */
function useRecordLogo(logoKey: string | undefined) {
  const [url, setUrl] = useState("");
  const [isPending, setIsPending] = useState(!!logoKey);

  useEffect(() => {
    if (!logoKey) {
      setUrl("");
      setIsPending(false);

      return;
    }

    let cancelled = false;
    let objectUrl = "";

    setIsPending(true);

    void (async () => {
      const blob = await readLogoAt(logoKey);

      // Re-checked after the await: React StrictMode tears the effect down and
      // re-runs it while this is still in flight, and minting a second object
      // URL for the same blob would leak the first.
      if (cancelled) return;

      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }

      setIsPending(false);
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [logoKey]);

  return { url, isPending };
}

/**
 * Split out so every hook below unmounts with the dialog — that is what revokes
 * the object URL and drops the canvas when the preview closes.
 */
function PreviewBody({ record }: { record: SavedQr }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const params = useMemo(() => new URLSearchParams(record.params), [record.params]);
  const logo = useRecordLogo(record.logoKey);

  const data = useMemo(() => dataFromParams(params), [params]);
  const exportSize = useMemo(() => exportSizeFromParams(params), [params]);
  const options = useMemo(() => optionsFromParams(params, logo.url), [params, logo.url]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || logo.isPending) return;

    // One instance, mounted only while the dialog is open. The list itself must
    // keep using the saved PNG thumbnails — twenty live canvases is the thing
    // the thumbnail exists to avoid.
    const qr = new QRCodeStyling({
      ...options,
      data,
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
    });

    qr.append(container);

    return () => container.replaceChildren();
  }, [data, options, logo.isPending]);

  const templateLabel =
    templateOptions.find((option) => option.key === record.template)?.label ?? "Free Text";

  return (
    <>
      <div className="flex justify-center">
        <div
          className="flex items-center justify-center overflow-hidden rounded-2xl border border-foreground/10 bg-white p-3"
          style={{ minWidth: PREVIEW_SIZE + 24, minHeight: PREVIEW_SIZE + 24 }}
        >
          {logo.isPending ? <Spinner size="sm" /> : <div ref={containerRef} />}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-foreground/60">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {templateLabel}
        </span>
        <span>
          Exports at {exportSize}×{exportSize}
        </span>
        {!!record.logoKey && <span>· With logo</span>}
      </div>

      {!!data && (
        <div className="max-h-32 overflow-auto rounded-xl border border-foreground/10 bg-background/70 p-2.5">
          {/* Same renderer as the Studio, so a saved payload is no more
              clickable here than it is there — only http(s) becomes a link. */}
          <LinkOrText data={data} className="break-all text-xs" />
        </div>
      )}
    </>
  );
}

function QrPreviewDialog({ record, onClose, onOpenInStudio }: Props) {
  return (
    <Modal isOpen={!!record} size="sm" scrollBehavior="inside" onClose={onClose}>
      <ModalContent>
        {record && (
          <>
            <ModalHeader className="truncate pr-10">{record.name}</ModalHeader>

            <ModalBody className="gap-3">
              <PreviewBody record={record} />
            </ModalBody>

            <ModalFooter>
              <Button size="sm" variant="light" onPress={onClose}>
                Close
              </Button>

              <Button size="sm" color="primary" onPress={() => onOpenInStudio(record)}>
                Open in Studio
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default QrPreviewDialog;
