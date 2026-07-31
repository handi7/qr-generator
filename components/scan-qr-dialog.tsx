"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { ImageUp, ScanLine, TriangleAlert } from "lucide-react";
import React, { DragEvent, useCallback, useEffect, useRef, useState } from "react";

import { templateOptions } from "@/constants/template.data";
import { detectCodec, paramsForPayload } from "@/utils/payloads";
import { decodeQrImage, findImageFile } from "@/utils/scan.utils";

type Status = "idle" | "decoding" | "done" | "error";

function ScanQrDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setPayload("");
    setError("");
    setIsDragging(false);
  }, []);

  const decode = useCallback(async (file: File | null) => {
    if (!file) {
      setStatus("error");
      setError("That doesn't look like an image file.");

      return;
    }

    setStatus("decoding");
    setError("");

    try {
      const decoded = await decodeQrImage(file);

      if (!decoded) {
        setStatus("error");
        setError("No QR code found in that image. Try a tighter crop or a sharper photo.");

        return;
      }

      setPayload(decoded);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("That image couldn't be read.");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onPaste = (event: ClipboardEvent) => {
      const file = findImageFile(event.clipboardData?.files);

      if (!file) return;

      event.preventDefault();
      void decode(file);
    };

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, [isOpen, decode]);

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void decode(findImageFile(event.dataTransfer.files));
  };

  const apply = () => {
    const params = paramsForPayload(new URLSearchParams(searchParams.toString()), payload);

    router.replace(`/studio?${params.toString()}`);
    onClose();
  };

  const detectedLabel =
    templateOptions.find((option) => option.key === detectCodec(payload).key)?.label ?? "Free Text";

  return (
    <>
      <Button size="sm" variant="flat" className="w-full" onPress={onOpen}>
        <ScanLine size={14} />
        Scan a QR code
      </Button>

      <Modal
        isOpen={isOpen}
        size="lg"
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        onClose={reset}
      >
        <ModalContent>
          <ModalHeader className="flex-col items-start gap-1">
            <h2 className="text-base font-semibold">Scan a QR code</h2>
            <p className="text-xs font-normal text-foreground/60">
              Drop an image, paste from the clipboard, or pick a file. Nothing is uploaded — the
              image is decoded in your browser.
            </p>
          </ModalHeader>

          <ModalBody className="gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-foreground/20 hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              <ImageUp className="text-foreground/50" size={26} />
              <span className="text-sm font-medium">Drop an image or click to choose</span>
              <span className="text-xs text-foreground/55">PNG, JPEG, WEBP, or a screenshot</span>
            </button>

            <input
              ref={inputRef}
              hidden
              accept="image/*"
              type="file"
              onChange={(event) => {
                void decode(findImageFile(event.target.files));
                // Clear it so picking the same file twice still fires onChange.
                event.target.value = "";
              }}
            />

            {status === "decoding" && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Spinner size="sm" />
                Decoding…
              </div>
            )}

            {status === "error" && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <TriangleAlert className="mt-0.5 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            {status === "done" && (
              <div className="space-y-3 rounded-xl border border-foreground/10 bg-background/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-primary">
                    Detected
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {detectedLabel}
                  </span>
                </div>

                {/* Rendered as plain text, never as a link: this content came from
                    an image someone else may have produced, and it should not be
                    one stray click away from opening. */}
                <p className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-foreground/80">
                  {payload}
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button size="sm" variant="light" onPress={onClose}>
              Cancel
            </Button>

            <Button size="sm" color="primary" isDisabled={status !== "done"} onPress={apply}>
              Fill Studio
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ScanQrDialog;
