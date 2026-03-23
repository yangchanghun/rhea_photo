import { create } from "zustand";

interface TableType {
  rows: number;
  columns: number;
}

interface Store {
  frame: string | null;
  table: TableType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: Record<string, any>;

  canNext: boolean;

  // actions
  setFrame: (frame: string | null) => void;
  setTable: (table: TableType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImages: (images: Record<string, any>) => void;
  setNext: (val: boolean) => void;
  resetState: () => void;
}

export const useStore = create<Store>((set) => ({
  // state
  frame: null,
  table: { rows: 2, columns: 1 },
  images: {},
  canNext: false,

  // actions
  setFrame: (frame) => set({ frame }),
  setTable: (table) => set({ table }),
  setImages: (images) => set({ images }),
  setNext: (val) => set({ canNext: val }),

  resetState: () =>
    set({
      frame: null,
      table: { rows: 2, columns: 1 },
      images: {},
      canNext: false,
    }),
}));
