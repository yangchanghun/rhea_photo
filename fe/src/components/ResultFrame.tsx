import { useStore } from "@store/useStore";

interface Props {
  rows?: number;
  columns?: number;
}

// 📐 프레임 사이즈 매핑 객체 (outer: 프레임 전체, inner: 사진 한 장)
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

export default function ResultFrame({ rows = 2, columns = 1 }: Props) {
  const { frameImg, targets } = useStore();

  const frameKey = `${columns}x${rows}`;
  const sizes = FRAME_SIZES[frameKey] || FRAME_SIZES["1x1"];

  return (
    <div className={`result-frame relative`}>
      {/* 바깥쪽 프레임 (배경 이미지 적용) */}
      <div
        className="outter-frame flex flex-col border border-gray-400 pt-[18px] pl-[18px]"
        style={{
          width: sizes.outer.w,
          height: sizes.outer.h,
          backgroundImage: frameImg ? `url(${frameImg})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          // Vue 원본 CSS를 반영한 테두리 두께 (위 0.5, 우 1, 아래 1, 좌 0.5)
          borderWidth: "0.5px 1px 1px 0.5px",
        }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex p-0 m-0">
            {Array.from({ length: columns }).map((_, colIdx) => {
              // 사진 순서 계산 (1번부터 시작)
              const slotId = rowIdx * columns + colIdx + 1;

              return (
                <div
                  key={`col-${colIdx}`}
                  className="inner-frame relative mb-[20px] mr-[20px] bg-white"
                  style={{
                    width: sizes.inner.w,
                    height: sizes.inner.h,
                  }}
                >
                  <img
                    src={targets[slotId]} // 스토어에서 가져온 최종 편집 이미지
                    className="w-full h-full object-cover border border-gray-400"
                    style={{
                      borderWidth: "0.5px 1px 1px 0.5px",
                    }}
                    alt={`slot-${slotId}`}
                    draggable="false"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
