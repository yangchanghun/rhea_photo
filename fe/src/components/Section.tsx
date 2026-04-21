import React from "react";
import { useStore } from "../store/useStore";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  const size = useStore((state) => state.size);
  const setSize = useStore((state) => state.setSize);

  return (
    <div className="mb-10">
      {/* 제목 + 셀렉트 */}
      <div className="mb-3 flex items-center gap-3 pl-3 text-left">
        <div className="text-xl font-bold">{title}</div>
        기종 선택
        <select
          value={String(size)}
          onChange={(e) => setSize(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm outline-none"
        >
          <option value="">선택</option>
          <option value="505">24,32인치</option>
          <option value="495">테블릿에듀</option>
        </select>
      </div>

      {/* 컨텐츠 */}
      <div className="flex flex-wrap justify-center gap-4">{children}</div>

      <hr className="mt-6" />
    </div>
  );
}
