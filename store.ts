import { create } from "zustand";

// State types
interface States {
  image: string;
}

// Action types
interface Actions {
  setImage: (image: string) => void;
  removeImage: () => void;
}

// useCounterStore
export const useImageStore = create<States & Actions>((set) => ({
  // States
  image: "",

  // Actions
  setImage: (image) => set((state) => ({ ...state, image })),
  removeImage: () => set((state) => ({ ...state, image: "" })),
}));
