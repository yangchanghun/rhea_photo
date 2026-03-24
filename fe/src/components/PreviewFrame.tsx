import { X } from "lucide-react"; // 닫기 아이콘 추가
import { useStore } from "@store/useStore";

interface PreviewFrameProps {
  rows?: number;
  columns?: number;
  onClose: () => void; // 🔥 닫기 함수 Props 추가
}

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

export default function PreviewFrame({
  rows = 2,
  columns = 1,
  onClose, // 🔥 닫기 함수 받기
}: PreviewFrameProps) {
  const { targets, frameImg } = useStore();

  const frameKey = `${columns}x${rows}`;
  const sizes = FRAME_SIZES[frameKey] || FRAME_SIZES["1x1"];

  return (
    // 🔥 화면 전체를 덮는 반투명 오버레이 (모달 배경)
    <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black/70 backdrop-blur-sm">
      {/* 모달 창 내부 */}
      <div className="relative bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">미리보기</h2>

        <div className="preview-frame flex justify-center items-center">
          <div
            className="shadow-[0.5px_0.5px_1.5px_black] p-[20px] pr-0 pb-0 flex flex-col relative" // bg-white 제거 (투명하게)
            style={{
              width: `${sizes.outer.w}px`,
              height: `${sizes.outer.h}px`,
              backgroundImage: frameImg ? `url(${frameImg})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: frameImg ? "transparent" : "white", // 이미지가 없으면 흰색 배경
            }}
          >
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <div key={`prev-row-${rowIdx}`} className="flex p-0 m-0 z-10">
                {Array.from({ length: columns }).map((_, colIdx) => {
                  const slotId = rowIdx * columns + colIdx + 1;
                  const hasImage = !!targets[slotId];

                  return (
                    <div
                      key={`prev-col-${colIdx}`}
                      className="relative mb-[20px] mr-[20px] bg-transparent shadow-[0.5px_0.5px_1.5px_black] overflow-hidden" // bg-white -> bg-transparent
                      style={{
                        width: `${sizes.inner.w}px`,
                        height: `${sizes.inner.h}px`,
                      }}
                    >
                      {hasImage ? (
                        <img
                          src={targets[slotId]}
                          id={`canvas-${slotId}`}
                          draggable="false"
                          className="w-full h-full object-cover object-center block"
                          alt={`Preview Slot ${slotId}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100/50 flex items-center justify-center text-gray-400">
                          Empty
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 확인 버튼 */}
        <button
          onClick={onClose}
          className="mt-8 px-8 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
        >
          확 인
        </button>
      </div>
    </div>
  );
}
