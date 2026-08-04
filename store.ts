import { create } from "zustand";

import { clearLogo, readLogo, writeLogo } from "@/utils/logo.utils";

interface States {
  /**
   * Object URL for the current logo, or "" when there is none. Object URL
   * rather than a data URL so a 2MB logo isn't held in memory as 2.7MB of
   * base64 on every render.
   */
  image: string;
  /** Whether the stored logo has been read back yet. */
  isRestored: boolean;
}

interface Actions {
  restoreImage: () => Promise<void>;
  /**
   * Takes a Blob rather than a File so opening a saved code can hand over the
   * logo it stored. False when the logo is usable this session but won't
   * survive a reload.
   */
  setImage: (blob: Blob) => Promise<boolean>;
  removeImage: () => Promise<void>;
}

export const useImageStore = create<States & Actions>((set, get) => ({
  image: "",
  isRestored: false,

  restoreImage: async () => {
    // Claimed before the await so a second mount — React StrictMode runs effects
    // twice in development — can't create a second object URL for the same blob.
    if (get().isRestored) return;

    set({ isRestored: true });

    const stored = await readLogo();

    if (stored) set({ image: URL.createObjectURL(stored) });
  },

  setImage: async (blob) => {
    const persisted = await writeLogo(blob);
    const previous = get().image;

    set({ image: URL.createObjectURL(blob), isRestored: true });

    // Only the previous render referenced this; holding it would leak the blob
    // for the lifetime of the document.
    if (previous) URL.revokeObjectURL(previous);

    return persisted;
  },

  removeImage: async () => {
    await clearLogo();

    const previous = get().image;

    set({ image: "" });

    if (previous) URL.revokeObjectURL(previous);
  },
}));
