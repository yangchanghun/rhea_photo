import { XCircle } from "lucide-react";
import { useStore } from "@store/useStore"; // 경로를 맞춰주세요

interface BasicFrameProps {
  rows?: number;
  columns?: number;
}

// 📐 기존 CSS 하드코딩을 대체하는 사이즈 매핑 객체
const FRAME_SIZES: Record<
  string,
  { outer: { w: number; h: number }; inner: { w: number; h: number } }
> = {
  "1x1": { outer: { w: 400, h: 350 }, inner: { w: 360, h: 270 } },
  "1x2": { outer: { w: 320, h: 520 }, inner: { w: 280, h: 210 } },
  "1x3": { outer: { w: 220, h: 525 }, inner: { w: 180, h: 135 } },
  "1x4": { outer: { w: 180, h: 560 }, inner: { w: 140, h: 105 } },
  "2x1": { outer: { w: 520, h: 320 }, inner: { w: 210, h: 280 } },
  "2x2": { outer: { w: 620, h: 520 }, inner: { w: 280, h: 210 } },
  "2x3": { outer: { w: 420, h: 525 }, inner: { w: 180, h: 135 } },
  "3x1": { outer: { w: 525, h: 220 }, inner: { w: 135, h: 180 } },
  "3x2": { outer: { w: 525, h: 420 }, inner: { w: 135, h: 180 } },
  "4x1": { outer: { w: 560, h: 180 }, inner: { w: 105, h: 140 } },
};

export default function BasicFrame({ rows = 2, columns = 1 }: BasicFrameProps) {
  const { targets, targetList, setTargets, setTargetList, setNext } =
    useStore();

  const frameKey = `${columns}x${rows}`;
  const sizes = FRAME_SIZES[frameKey] || FRAME_SIZES["1x1"]; // 기본값 방어 코드

  // 이미지 삭제 로직
  const removeImg = (slotId: number) => {
    const newTargets = { ...targets };
    const newTargetList = { ...targetList };

    delete newTargets[slotId];
    delete newTargetList[slotId];

    setTargets(newTargets);
    setTargetList(newTargetList);
    setNext(false); // 하나라도 지워지면 Next 비활성화
  };

  return (
    <div className="basic-frame">
      <div
        className="bg-white shadow-[0.5px_0.5px_1.5px_black] p-[20px] pr-0 pb-0 flex flex-col"
        style={{ width: `${sizes.outer.w}px`, height: `${sizes.outer.h}px` }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex p-0 m-0">
            {Array.from({ length: columns }).map((_, colIdx) => {
              // 현재 슬롯 번호 계산 (1, 2, 3...)
              const slotId = rowIdx * columns + colIdx + 1;
              const hasImage = !!targets[slotId];

              return (
                <div
                  key={`col-${colIdx}`}
                  className="relative mb-[20px] mr-[20px] bg-white shadow-[0.5px_0.5px_1.5px_black]"
                  style={{
                    width: `${sizes.inner.w}px`,
                    height: `${sizes.inner.h}px`,
                  }}
                >
                  {!hasImage ? (
                    // 🔲 비어있는 프레임
                    <div className="w-full h-full flex justify-center items-center">
                      <div className="h-[60px] w-[60px] rounded-full bg-slate-400 text-white text-3xl shadow-[0.5px_0.5px_1.5px_black] flex justify-center items-center">
                        {slotId}
                      </div>
                    </div>
                  ) : (
                    // 🖼️ 이미지가 채워진 프레임
                    <div className="w-full h-full relative">
                      <img
                        src={targets[slotId]}
                        id={`canvas-${slotId}`}
                        draggable="false"
                        className="w-full h-full object-cover object-center"
                        alt={`Slot ${slotId}`}
                      />
                      <div
                        className="absolute top-2 left-2 text-3xl cursor-pointer text-gray-800 hover:text-red-500 transition-colors"
                        onClick={() => removeImg(slotId)}
                      >
                        <XCircle className="w-8 h-8 fill-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
