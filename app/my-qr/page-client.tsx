"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  addToast,
  useDisclosure,
} from "@heroui/react";
import {
  Bookmark,
  Check,
  Download,
  Pencil,
  QrCode,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import QrPreviewDialog from "@/components/qr-preview-dialog";
import SavedQrShare from "@/components/saved-qr-share";
import { templateOptions } from "@/constants/template.data";
import { useImageStore } from "@/store";
import { applyBackup, backupFilename, buildBackup, parseBackup } from "@/utils/backup.utils";
import { downloadBlob } from "@/utils/blob.utils";
import { readLogoAt } from "@/utils/logo.utils";
import {
  SavedQr,
  deleteAllSavedQrs,
  deleteSavedQr,
  listSavedQrs,
  renameSavedQr,
} from "@/utils/saved-qr.utils";

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
  const clearAll = useDisclosure();

  const importRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [records, setRecords] = useState<SavedQr[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [preview, setPreview] = useState<SavedQr | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedQr | null>(null);

  const refresh = useCallback(async () => {
    setRecords(await listSavedQrs());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    // Focus is moved here rather than with `autoFocus` so it happens as a
    // response to the rename button, not on every mount of the input.
    if (editingId) nameInputRef.current?.focus();
  }, [editingId]);

  const open = async (record: SavedQr) => {
    // The Studio logo slot has to become this record's logo before navigating,
    // or the code would render with whatever logo happened to be loaded.
    const blob = record.logoKey ? await readLogoAt(record.logoKey) : null;

    if (blob) await setImage(blob);
    else await removeImage();

    router.push(`/studio?${record.params}${record.params ? "&" : ""}id=${record.id}`);
  };

  const remove = async () => {
    const record = pendingDelete;

    if (!record) return;

    // Dismissed first, like the delete-all flow: leaving the dialog up behind a
    // spinner invites a second press on a record that is already going away.
    setPendingDelete(null);
    setIsBusy(true);

    try {
      await deleteSavedQr(record.id);
      await refresh();
      addToast({ title: "Deleted", description: record.name, color: "success" });
    } finally {
      setIsBusy(false);
    }
  };

  const commitRename = async (record: SavedQr) => {
    const next = draftName.trim();

    setEditingId(null);

    if (!next || next === record.name) return;

    await renameSavedQr(record.id, next);
    await refresh();
  };

  const exportAll = async () => {
    setIsBusy(true);

    try {
      const backup = await buildBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });

      downloadBlob(blob, backupFilename());
      addToast({
        title: "Backup downloaded",
        description: `${backup.codes.length} code${backup.codes.length === 1 ? "" : "s"} included.`,
        color: "success",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;

    setIsBusy(true);

    try {
      const backup = parseBackup(await file.text());
      const result = await applyBackup(backup);

      await refresh();
      addToast({
        title: "Backup imported",
        description: `${result.added} added, ${result.updated} updated, ${result.skipped} unchanged.`,
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Couldn't import that file",
        description: error instanceof Error ? error.message : undefined,
        color: "danger",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const removeEverything = async () => {
    clearAll.onClose();
    setIsBusy(true);

    try {
      await deleteAllSavedQrs();
      await refresh();
      addToast({ title: "All saved codes deleted", color: "success" });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Library</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">My QR Codes</h1>
            <p className="max-w-2xl text-sm text-foreground/65">
              Saved in this browser only — nothing is uploaded. Clearing your browsing data will
              remove them.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="flat" isDisabled={isBusy} onPress={() => void exportAll()}>
              <Download size={14} />
              Export
            </Button>

            <Button
              size="sm"
              variant="flat"
              isDisabled={isBusy}
              onPress={() => importRef.current?.click()}
            >
              <Upload size={14} />
              Import
            </Button>

            <input
              ref={importRef}
              hidden
              accept="application/json,.json"
              type="file"
              onChange={(event) => {
                void importFile(event.target.files?.[0]);
                // Clear it so picking the same file twice still fires onChange.
                event.target.value = "";
              }}
            />

            {records.length > 0 && (
              <Button
                size="sm"
                color="danger"
                variant="flat"
                isDisabled={isBusy}
                onPress={clearAll.onOpen}
              >
                <Trash2 size={14} />
                Delete all
              </Button>
            )}
          </div>
        </div>

        {records.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm">
            <ShieldAlert className="mt-0.5 shrink-0 text-warning" size={16} />
            <p className="text-foreground/75">
              Saved codes are stored unencrypted, so anything inside them — WiFi passwords, phone
              numbers, addresses — is readable by anyone who can use this browser profile. Export a
              backup and delete them if you&apos;re on a shared computer.
            </p>
          </div>
        )}

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
                Design a QR code in Studio and press Save to keep it here, or import a backup.
              </p>
            </div>

            <Button as={Link} href="/studio" size="sm" color="primary">
              Open Studio
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/75 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  {/* A button, not the card: rename and delete live in here
                      too, so making the whole row clickable would put a preview
                      one stray click away from every other action. The preview
                      renders live from `params`, so this works even for a
                      record whose thumbnail failed to generate. */}
                  <button
                    type="button"
                    aria-label={`Preview ${record.name}`}
                    className="flex size-20 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-white transition hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={() => setPreview(record)}
                  >
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
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    {editingId === record.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          ref={nameInputRef}
                          size="sm"
                          aria-label="QR code name"
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") void commitRename(record);
                            if (event.key === "Escape") setEditingId(null);
                          }}
                        />

                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          aria-label="Save name"
                          onPress={() => void commitRename(record)}
                        >
                          <Check size={14} />
                        </Button>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          aria-label="Cancel rename"
                          onPress={() => setEditingId(null)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <p className="truncate text-sm font-semibold">{record.name}</p>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          aria-label={`Rename ${record.name}`}
                          onPress={() => {
                            setDraftName(record.name);
                            setEditingId(record.id);
                          }}
                        >
                          <Pencil size={12} />
                        </Button>
                      </div>
                    )}

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

                  <SavedQrShare record={record} />

                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="flat"
                    aria-label={`Delete ${record.name}`}
                    onPress={() => setPendingDelete(record)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QrPreviewDialog
        record={preview}
        onClose={() => setPreview(null)}
        onOpenInStudio={(record) => void open(record)}
      />

      <Modal isOpen={!!pendingDelete} size="sm" onClose={() => setPendingDelete(null)}>
        <ModalContent>
          {pendingDelete && (
            <>
              <ModalHeader>Delete this saved code?</ModalHeader>

              <ModalBody>
                <p className="text-sm text-foreground/70">
                  This removes{" "}
                  <span className="wrap-break-words font-medium text-foreground">
                    {pendingDelete.name}
                  </span>
                  {pendingDelete.logoKey ? " and the logo saved with it" : " "} from this browser.
                  It can&apos;t be undone — export a backup first if you might want it back.
                </p>
              </ModalBody>

              <ModalFooter>
                <Button size="sm" variant="light" onPress={() => setPendingDelete(null)}>
                  Cancel
                </Button>

                <Button size="sm" color="danger" onPress={() => void remove()}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={clearAll.isOpen} size="sm" onOpenChange={clearAll.onOpenChange}>
        <ModalContent>
          <ModalHeader>Delete all saved codes?</ModalHeader>

          <ModalBody>
            <p className="text-sm text-foreground/70">
              This removes all {records.length} saved codes and their logos from this browser. It
              can&apos;t be undone — export a backup first if you might want them back.
            </p>
          </ModalBody>

          <ModalFooter>
            <Button size="sm" variant="light" onPress={clearAll.onClose}>
              Cancel
            </Button>

            <Button size="sm" color="danger" onPress={() => void removeEverything()}>
              Delete all
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default SavedQrList;
