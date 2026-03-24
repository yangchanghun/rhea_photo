import { create } from "zustand";

interface TableType {
  rows: number;
  columns: number;
}

interface Store {
  frame: string | null;
  table: TableType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: Record<string, any>; // 업로드/촬영된 원본 이미지들

  // 🔥 새로 추가된 프레임(액자) 상태
  targets: Record<number, string>; // 슬롯 번호(1~N)에 매핑된 이미지 소스(src)
  targetList: Record<number, string>; // 슬롯 번호에 매핑된 원본 이미지의 ID

  canNext: boolean;

  frameImg: string | null; // 🔥 새로 추가 (꾸미기 완성본 이미지)

  // actions
  setFrame: (frame: string | null) => void;
  setTable: (table: TableType) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setImages: (images: Record<string, any>) => void;
  setTargets: (targets: Record<number, string>) => void; // 🔥 추가
  setTargetList: (targetList: Record<number, string>) => void; // 🔥 추가
  setNext: (val: boolean) => void;
  resetState: () => void;

  setFrameImg: (img: string | null) => void; // 🔥 액션 추가
}

export const useStore = create<Store>((set) => ({
  // state
  frame: null,
  table: { rows: 2, columns: 1 },
  images: {},
  targets: {}, // 🔥 초기화
  targetList: {}, // 🔥 초기화
  canNext: false,
  frameImg: null,
  // actions
  setFrameImg: (img) => set({ frameImg: img }),
  setFrame: (frame) => set({ frame }),
  setTable: (table) => set({ table }),
  setImages: (images) => set({ images }),
  setTargets: (targets) => set({ targets }), // 🔥 액션 추가
  setTargetList: (targetList) => set({ targetList }), // 🔥 액션 추가
  setNext: (val) => set({ canNext: val }),

  resetState: () =>
    set({
      frame: null,
      table: { rows: 2, columns: 1 },
      images: {},
      targets: {}, // 🔥 초기화
      targetList: {}, // 🔥 초기화
      canNext: false,
      frameImg: null, // 초기화 시 같이 비워주기
    }),
}));
