"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { motion } from "framer-motion";
import {
  Bookmark,
  Copy,
  Download,
  Link2,
  QrCode as QrCodeIcon,
  Share2,
  Sparkles,
} from "lucide-react";
import QRCodeStyling, { FileExtension, Options } from "qr-code-styling";
import { Suspense, useEffect, useRef, useState } from "react";

import LinkOrText from "@/components/link-or-text";
import SaveQrButton from "@/components/save-qr-button";
import useShareQr from "@/hokks/useShareQr";

type QrCodeProps = {
  data: string;
  options?: Partial<Options>;
};

const QrCode: React.FC<QrCodeProps> = ({ data, options }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const [extension, setExtension] = useState<FileExtension>("png");
  const [name, setName] = useState<string>("qr");

  const { canShareImage, canCopyImage, prepare, shareImage, copyImage, copyLink } = useShareQr(
    qrCode,
    name,
  );

  const onDownloadClick = () => {
    qrCode.current?.download({ name, extension });
  };

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        data,
        width: 480,
        height: 480,
        dotsOptions: {
          color: "#000",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        ...options,
      });
    }

    qrCode.current.update({ data, ...options });

    if (qrCodeRef.current) {
      qrCode.current.append(qrCodeRef.current);
    }

    // Cache the PNG now so the share button never has to await it on click.
    prepare();
  }, [data, options, prepare]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full min-w-72 max-w-[740px]"
    >
      <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_0%_0%,rgba(25,194,160,0.14),transparent_45%),radial-gradient(450px_circle_at_100%_0%,rgba(66,103,178,0.14),transparent_42%)]" />

        <div className="relative border-b border-foreground/10 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <Sparkles size={12} />
                Live Studio Preview
              </p>
              <h1 className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
                <QrCodeIcon size={18} />
                QR Code Generator
              </h1>
            </div>

            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">
              Ready to export
            </span>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6 p-5 sm:p-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-3xl border border-foreground/10 bg-background/80 p-5 shadow-lg shadow-primary/10"
          >
            <div className="overflow-auto">
              <div ref={qrCodeRef} />
            </div>
          </motion.div>

          <div className="w-full rounded-2xl border border-foreground/10 bg-background/70 p-3 text-center sm:p-4">
            <LinkOrText data={data} className="break-all text-center text-xs sm:text-sm" />
          </div>

          <div className="grid w-full gap-3 md:grid-cols-[1fr_180px] md:items-end">
            <Input
              size="sm"
              radius="sm"
              label="Filename"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              size="sm"
              radius="sm"
              label="File Type"
              selectionMode="single"
              selectedKeys={[extension]}
              onSelectionChange={(keys) => setExtension(keys.currentKey as FileExtension)}
            >
              <SelectItem key="jpeg">JPEG</SelectItem>
              <SelectItem key="png">PNG</SelectItem>
              <SelectItem key="svg">SVG</SelectItem>
              <SelectItem key="webp">WEBP</SelectItem>
            </Select>
          </div>

          <div className="flex w-full flex-wrap gap-2">
            <Button size="sm" color="primary" onPress={onDownloadClick} className="min-w-28">
              <Download size={14} />
              Download
            </Button>

            {/* Both image actions depend on browser support detected after
                mount, so neither renders during SSR. Share is preferred; the
                clipboard is the stand-in where Web Share can't take files. */}
            {canShareImage && (
              <Button size="sm" color="primary" variant="flat" onPress={shareImage}>
                <Share2 size={14} />
                Share
              </Button>
            )}

            {!canShareImage && canCopyImage && (
              <Button size="sm" color="primary" variant="flat" onPress={copyImage}>
                <Copy size={14} />
                Copy image
              </Button>
            )}

            <Button size="sm" variant="flat" onPress={copyLink}>
              <Link2 size={14} />
              Copy link
            </Button>

            {/* Its own boundary: this card also serves as the Suspense fallback
                on /studio, and a fallback renders outside the parent boundary —
                so the useSearchParams() inside would bail out of prerendering.
                The placeholder keeps the row from shifting. */}
            <Suspense
              fallback={
                <Button size="sm" color="primary" variant="flat" isDisabled>
                  <Bookmark size={14} />
                  Save
                </Button>
              }
            >
              <SaveQrButton data={data} options={options} name={name} />
            </Suspense>
          </div>

          {!!options?.image && (
            <p className="w-full text-center text-xs text-foreground/60">
              A copied link carries every style setting, but not the uploaded logo — an image
              can&apos;t be encoded in a URL.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QrCode;
