"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Spinner, addToast } from "@heroui/react";
import { Bookmark, QrCode, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { templateOptions } from "@/constants/template.data";
import { useImageStore } from "@/store";
import { readLogoAt } from "@/utils/logo.utils";
import { SavedQr, deleteSavedQr, listSavedQrs } from "@/utils/saved-qr.utils";

function templateLabel(key: string) {
  return templateOptions.find((option) => option.key === key)?.label ?? "Free Text";
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SavedQrList() {
  const router = useRouter();
  const setImage = useImageStore((state) => state.setImage);
  const removeImage = useImageStore((state) => state.removeImage);

  const [records, setRecords] = useState<SavedQr[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setRecords(await listSavedQrs());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const open = async (record: SavedQr) => {
    // The Studio logo slot has to become this record's logo before navigating,
    // or the code would render with whatever logo happened to be loaded.
    const blob = record.logoKey ? await readLogoAt(record.logoKey) : null;

    if (blob) await setImage(blob);
    else await removeImage();

    router.push(`/studio?${record.params}${record.params ? "&" : ""}id=${record.id}`);
  };

  const remove = async (record: SavedQr) => {
    await deleteSavedQr(record.id);
    await refresh();
    addToast({ title: "Deleted", description: record.name, color: "success" });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Library</p>
          <h1 className="text-2xl font-semibold sm:text-3xl">My QR Codes</h1>
          <p className="max-w-2xl text-sm text-foreground/65">
            Saved in this browser only — nothing is uploaded. Clearing your browsing data will
            remove them.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-foreground/60">
            <Spinner size="sm" />
            Loading…
          </div>
        ) : records.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-foreground/20 p-12 text-center">
            <Bookmark className="text-foreground/40" size={28} />
            <div className="space-y-1">
              <p className="text-sm font-medium">Nothing saved yet</p>
              <p className="text-sm text-foreground/60">
                Design a QR code in Studio and press Save to keep it here.
              </p>
            </div>

            <Button as={Link} href="/studio" size="sm" color="primary">
              Open Studio
            </Button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/75 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-white">
                    {record.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={record.thumbnail}
                        alt=""
                        width={80}
                        height={80}
                        className="size-full object-contain"
                      />
                    ) : (
                      <QrCode className="text-foreground/30" size={24} />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold">{record.name}</p>
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {templateLabel(record.template)}
                    </span>
                    <p className="text-xs text-foreground/55">
                      Updated {formatDate(record.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    className="flex-1"
                    onPress={() => void open(record)}
                  >
                    Open in Studio
                  </Button>

                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    aria-label={`Delete ${record.name}`}
                    onPress={() => void remove(record)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SavedQrList;
