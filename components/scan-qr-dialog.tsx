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
import { Camera, ImageUp, ScanLine, TriangleAlert } from "lucide-react";
import React, { DragEvent, useCallback, useEffect, useRef, useState } from "react";

import { templateOptions } from "@/constants/template.data";
import { detectCodec, paramsForPayload } from "@/utils/payloads";
import {
  decodeQrImage,
  decodeQrVideoFrame,
  describeCameraError,
  findImageFile,
  isCameraSupported,
  startCamera,
  stopCamera,
} from "@/utils/scan.utils";

type Status = "idle" | "decoding" | "scanning" | "done" | "error";

/** Decoding every frame would peg a CPU core for no extra responsiveness. */
const FRAME_INTERVAL = 200;

function ScanQrDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    // Probed after mount: navigator is absent during SSR, and branching on it
    // while rendering would desync hydration.
    setHasCamera(isCameraSupported());
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setPayload("");
    setError("");
    setIsDragging(false);
    setIsCameraOn(false);
  }, []);

  const decodeFile = useCallback(async (file: File | null) => {
    if (!file) {
      setStatus("error");
      setError("That doesn't look like an image file.");

      return;
    }

    setIsCameraOn(false);
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
    if (!isOpen || !isCameraOn) return;

    // Guarded by a local flag rather than state: cleanup can run while an
    // await is still in flight, and the stream must be released either way.
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stream: MediaStream | undefined;

    const scan = async () => {
      const video = videoRef.current;

      if (cancelled || !video) return;

      try {
        const decoded = await decodeQrVideoFrame(video);

        if (cancelled) return;

        if (decoded) {
          setPayload(decoded);
          setStatus("done");
          // Turning the camera off re-runs this effect's cleanup, which is what
          // actually releases the device.
          setIsCameraOn(false);

          return;
        }
      } catch {
        // A single unreadable frame is not a failure; keep looking.
      }

      timer = setTimeout(() => void scan(), FRAME_INTERVAL);
    };

    const open = async () => {
      setStatus("scanning");
      setError("");

      try {
        stream = await startCamera();

        if (cancelled) {
          stopCamera(stream);

          return;
        }

        const video = videoRef.current;

        if (!video) return;

        video.srcObject = stream;
        await video.play();

        if (cancelled) return;

        void scan();
      } catch (caught) {
        if (cancelled) return;

        setStatus("error");
        setError(describeCameraError(caught));
        setIsCameraOn(false);
      }
    };

    void open();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopCamera(stream);

      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [isOpen, isCameraOn]);

  useEffect(() => {
    if (!isOpen) return;

    const onPaste = (event: ClipboardEvent) => {
      const file = findImageFile(event.clipboardData?.files);

      if (!file) return;

      event.preventDefault();
      void decodeFile(file);
    };

    document.addEventListener("paste", onPaste);

    return () => document.removeEventListener("paste", onPaste);
  }, [isOpen, decodeFile]);

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void decodeFile(findImageFile(event.dataTransfer.files));
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
              Use your camera, drop an image, paste from the clipboard, or pick a file. Nothing is
              uploaded — decoding happens in your browser.
            </p>
          </ModalHeader>

          <ModalBody className="gap-4">
            {isCameraOn ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-black">
                  {/* muted + playsInline are what let iOS Safari play inline
                      instead of taking over the screen. */}
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className="aspect-video w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-40 rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-foreground/70">
                    <Spinner size="sm" />
                    Point the camera at a QR code
                  </span>

                  <Button size="sm" variant="flat" onPress={() => setIsCameraOn(false)}>
                    Stop
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {hasCamera && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => setIsCameraOn(true)}
                  >
                    <Camera size={14} />
                    Use camera
                  </Button>
                )}

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
                  <span className="text-xs text-foreground/55">
                    PNG, JPEG, WEBP, or a screenshot
                  </span>
                </button>
              </>
            )}

            <input
              ref={inputRef}
              hidden
              accept="image/*"
              type="file"
              onChange={(event) => {
                void decodeFile(findImageFile(event.target.files));
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
