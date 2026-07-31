"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, addToast } from "@heroui/react";
import { Bookmark } from "lucide-react";
import QRCodeStyling, { Options } from "qr-code-styling";
import React, { useState } from "react";

import { useImageStore } from "@/store";
import { blobToDataUrl } from "@/utils/blob.utils";
import { copyStudioLogoTo, deleteLogoAt, logoKeyFor } from "@/utils/logo.utils";
import { SavedQr, newId, readSavedQr, writeSavedQr } from "@/utils/saved-qr.utils";
import { normalizeTemplateType } from "@/utils/template.utils";

interface Props {
  data: string;
  options?: Partial<Options>;
  name: string;
}

const THUMBNAIL_SIZE = 120;

/**
 * Rendered off a throwaway instance rather than the one on screen: the list
 * wants 120px, and resizing the live preview would make it flicker.
 */
async function renderThumbnail(data: string, options?: Partial<Options>) {
  try {
    const qr = new QRCodeStyling({
      ...options,
      data,
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
    });
    const blob = await qr.getRawData("png");

    return blob instanceof Blob ? await blobToDataUrl(blob) : undefined;
  } catch {
    // A missing thumbnail costs the card its preview, not the save.
    return undefined;
  }
}

function SaveQrButton({ data, options, name }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logo = useImageStore((state) => state.image);

  const [isSaving, setIsSaving] = useState(false);

  const existingId = searchParams.get("id");

  const save = async () => {
    setIsSaving(true);

    try {
      const id = existingId || newId();
      const params = new URLSearchParams(searchParams.toString());

      // `id` identifies the record, so it must not be part of what the record
      // stores — otherwise restoring would nest one id inside another.
      params.delete("id");

      const previous = existingId ? await readSavedQr(existingId) : null;
      const hasLogo = !!logo;
      const logoKey = logoKeyFor(id);

      if (hasLogo) await copyStudioLogoTo(logoKey);
      // The logo was removed since the last save; drop the orphaned copy.
      else if (previous?.logoKey) await deleteLogoAt(previous.logoKey);

      const now = Date.now();
      const record: SavedQr = {
        id,
        name: name.trim() || "Untitled QR",
        template: normalizeTemplateType(searchParams.get("template") ?? undefined),
        params: params.toString(),
        logoKey: hasLogo ? logoKey : undefined,
        thumbnail: await renderThumbnail(data, options),
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
      };

      const stored = await writeSavedQr(record);

      if (!stored) {
        addToast({
          title: "Couldn't save",
          description: "This browser is blocking local storage.",
          color: "danger",
        });

        return;
      }

      // Pin the id so the next save updates this record instead of adding a copy.
      if (!existingId) {
        params.set("id", id);
        router.replace(`/studio?${params.toString()}`);
      }

      addToast({
        title: existingId ? "Changes saved" : "Saved to My QR",
        description: record.name,
        color: "success",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      size="sm"
      color="primary"
      variant="flat"
      isLoading={isSaving}
      onPress={() => void save()}
    >
      {!isSaving && <Bookmark size={14} />}
      {existingId ? "Update" : "Save"}
    </Button>
  );
}

export default SaveQrButton;
