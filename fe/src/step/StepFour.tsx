import { useState, useEffect, useRef, useCallback } from "react";
// ✅ 완벽한 v5 임포트 방식
import { fabric } from "fabric";
import { AlertCircle } from "lucide-react";
import { useStore } from "@store/useStore";
import PreviewFrame from "@components/PreviewFrame";

interface Props {
  className?: string;
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

export default function StepFour({ className }: Props) {
  const { frame, targets, table, setFrameImg } = useStore();

  const rows = table?.rows || parseInt(frame?.split("x")[1] || "2");
  const columns = table?.columns || parseInt(frame?.split("x")[0] || "1");

  const [isOpen, setIsOpen] = useState(false);
  const [isMode, setIsMode] = useState<"bg" | "sticker">("bg");
  const [isWork, setIsWork] = useState(false);

  const [targetColor, setTargetColor] = useState<string>("#FFF");
  const [targetPattern, setTargetPattern] = useState<string | null>(null);
  const [targetSticker, setTargetSticker] = useState<string | null>(null);

  const targetStickerRef = useRef<string | null>(null);

  useEffect(() => {
    targetStickerRef.current = targetSticker;
  }, [targetSticker]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const picContainerRef = useRef<HTMLDivElement>(null);
  const decoContainerRef = useRef<HTMLDivElement>(null);
  const patternRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const stickerRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const frameKey = `${columns}x${rows}`;
  const sizes = FRAME_SIZES[frameKey] || FRAME_SIZES["1x1"];

  const bgColors = {
    simple: ["#F2F2F3", "#A6A6A6", "#595959", "#262626", "#0D0D0D"],
    modern: ["#131B26", "#D9B95B", "#D9C484", "#F2ECE4", "#D97D5B"],
    warm: ["#D9C077", "#F29F05", "#D97904", "#BF4904", "#F2F2F2"],
    astro: ["#F25E7A", "#4A2B8C", "#5155A6", "#05F2DB", "#F2E963"],
    cartoon: ["#636AF2", "#41A0F2", "#A2DCF2", "#04D98B", "#F2E205"],
    ancient: ["#1D5948", "#F2BF5E", "#A6864B", "#F2D091", "#732509"],
  };

  const patterns = {
    basic: Array.from({ length: 9 }, (_, i) => i + 1),
  };

  const stickers = {
    cute_handdrawn: Array.from({ length: 6 }, (_, i) => i + 1),
    cute_natural_doodle: Array.from({ length: 12 }, (_, i) => i + 1),
    flower_leaf: Array.from({ length: 38 }, (_, i) => i + 1),
  };

  // --- [저장 로직] ---
  const saveWork = useCallback(() => {
    if (!fabricCanvas.current) return;
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.renderAll();
    if (setFrameImg) {
      const dataUrl = fabricCanvas.current.toDataURL({
        format: "png",
        quality: 1,
      });
      setFrameImg(dataUrl);
    }
  }, [setFrameImg]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!fabricCanvas.current) return;
      const canvas = fabricCanvas.current;
      const pressKey = e.key.toUpperCase();

      if (pressKey === "DELETE" || pressKey === "BACKSPACE") {
        const targetObj = canvas.getActiveObject();
        if (targetObj) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (targetObj.isEditing) return;
          canvas.remove(targetObj);
          canvas.renderAll();
          saveWork();
        }
      }
    },
    [saveWork],
  );

  // --- [초기화 및 Fabric.js 세팅] ---
  useEffect(() => {
    if (!canvasRef.current) return;

    // ✅ 중복 찌꺼기 코드 제거! 오직 하나만 생성합니다.
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: sizes.outer.w,
      height: sizes.outer.h,
      backgroundColor: "#FFF",
    });

    fabricCanvas.current = canvas;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("mouse:down", (e: any) => {
      const currentStickerId = targetStickerRef.current;
      // 스티커 모드이면서, 클릭된 지점이 있고, 선택된 스티커가 있을 때
      if (
        picContainerRef.current?.style.zIndex === "1" &&
        e.pointer &&
        currentStickerId
      ) {
        createObj("sticker", e.pointer.x, e.pointer.y, currentStickerId);
      } else if (e.target) {
        canvas.renderAll();
      }
    });

    canvas.on("selection:created", () => {
      if (
        fabricCanvas.current &&
        fabricCanvas.current.getActiveObjects().length > 1
      ) {
        fabricCanvas.current.discardActiveObject();
        fabricCanvas.current.renderAll();
      }
    });

    canvas.on("selection:cleared", () => {
      saveWork();
    });

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      saveWork();
      canvas.dispose();
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes]);

  // --- [작업 모드(Z-Index) 토글] ---
  useEffect(() => {
    if (
      !picContainerRef.current ||
      !decoContainerRef.current ||
      !fabricCanvas.current
    )
      return;

    const canvas = fabricCanvas.current;
    canvas.discardActiveObject();

    // 모드에 따라 객체 선택 여부 제어
    const isStickerMode = isMode === "sticker";
    canvas.getObjects().forEach((obj) => {
      obj.selectable = isStickerMode;
      obj.evented = isStickerMode;
    });

    canvas.renderAll();

    if (isWork) {
      picContainerRef.current.style.zIndex = "1";
      decoContainerRef.current.style.zIndex = "2";
      picContainerRef.current.style.opacity = "0.8"; // 스티커 붙이기 쉽게 배경을 살짝 흐리게
    } else {
      picContainerRef.current.style.zIndex = "2";
      decoContainerRef.current.style.zIndex = "1";
      picContainerRef.current.style.opacity = "1";
    }
  }, [isWork, isMode]);

  // --- [객체 생성] ---
  const createObj = (
    _type: "sticker",
    left: number,
    top: number,
    stickerId?: string,
  ) => {
    const canvas = fabricCanvas.current;
    if (!canvas || !stickerId) return;

    const imgElement = stickerRefs.current[stickerId];
    if (!imgElement) return;

    fabric.Image.fromURL(imgElement.src, (image) => {
      image.set({
        left: left,
        top: top,
        originX: "center", // 중앙 기준 클릭 지점
        originY: "center",
        borderColor: "red",
        cornerColor: "green",
        cornerSize: 10,
        transparentCorners: false,
        selectable: true,
      });

      if (image.width && image.height) {
        if (image.width > 150) {
          image.scaleToWidth(100); // 너무 큰 스티커는 자동 축소
        }
      }

      canvas.add(image);
      canvas.setActiveObject(image);
      canvas.renderAll();
      saveWork();
    });

    setTargetSticker(null); // 붙인 후 스티커 선택 해제
  };

  // --- [배경 및 패턴 설정] ---
  const handleSelectBg = (color: string) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    if (targetColor === color) {
      setTargetColor("#FFF");
      canvas.backgroundColor = "#FFF";
    } else {
      setTargetColor(color);
      setTargetPattern(null);
      canvas.backgroundColor = color;
    }
    canvas.renderAll();
    saveWork();
  };

  const handleBackBg = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    // 선택 상태 해제
    canvas.discardActiveObject();

    // 캔버스 위 스티커 전부 제거
    canvas.getObjects().forEach((obj) => {
      canvas.remove(obj);
    });

    // 배경 초기화
    setTargetColor("#FFF");
    setTargetPattern(null);
    setTargetSticker(null);

    canvas.backgroundColor = "#FFF";
    canvas.renderAll();
    saveWork();
  };

  const handleSelectPattern = (patternId: string) => {
    const canvas = fabricCanvas.current;
    const imgElement = patternRefs.current[patternId];
    if (!canvas || !imgElement) return;

    if (targetPattern === patternId) {
      canvas.backgroundColor = "#FFF";
      setTargetColor("#FFF");
      setTargetPattern(null);
      saveWork();
    } else {
      setTargetColor("#FFF");
      setTargetPattern(patternId);

      const pattern = new fabric.Pattern({
        source: imgElement,
        repeat: "repeat",
      });

      canvas.setBackgroundColor(pattern, () => {
        canvas.renderAll();
        saveWork();
      });
    }
  };

  return (
    <div className={`step-four ${className || ""}`}>
      <div className="flex flex-col md:flex-row m-0 p-0 mb-12 gap-8">
        {/* ================= 좌측: 캔버스 영역 ================= */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6 px-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <button
                className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
                onClick={() => {
                  saveWork();
                  setIsOpen(true);
                }}
              >
                미 리 보 기
              </button>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="relative group flex items-center gap-2 cursor-help">
                <AlertCircle className="text-gray-500" />
                <small className="text-gray-500">주의사항</small>
                <div className="absolute top-10 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white border border-gray-300 p-4 w-64 shadow-xl z-50 text-sm text-center text-red-500 font-bold rounded">
                  스티커 모드를 클릭한 뒤<br />
                  스티커를 고르고 화면을 클릭하세요!
                </div>
              </div>
            </div>
          </div>

          {/* 작업 영역 */}
          <div className="relative flex justify-center w-full mb-6">
            {/* 1. 사진 프레임 영역 (pointer-events-none이 스티커를 뚫게 해줌) */}
            <div
              ref={picContainerRef}
              className="absolute pointer-events-none p-[20px] pr-0 flex flex-col transition-opacity"
              style={{ width: sizes.outer.w, height: sizes.outer.h }}
            >
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={`pic-row-${rowIdx}`} className="flex p-0 m-0">
                  {Array.from({ length: columns }).map((_, colIdx) => {
                    const slotId = rowIdx * columns + colIdx + 1;
                    return (
                      <div
                        key={`pic-col-${colIdx}`}
                        className="relative mb-[20px] mr-[20px] bg-white shadow-[0.5px_0.5px_1.5px_black]"
                        style={{ width: sizes.inner.w, height: sizes.inner.h }}
                      >
                        {targets[slotId] && (
                          <img
                            src={targets[slotId]}
                            className="w-full h-full object-cover pointer-events-auto"
                            alt={`slot-${slotId}`}
                            draggable={false}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 2. 꾸미기 캔버스 영역 */}
            <div
              ref={decoContainerRef}
              className="shadow-[0.5px_0.5px_1.5px_black] transition-opacity"
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
          <button
            className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
            onClick={() => {
              handleBackBg();
            }}
          >
            초 기 화
          </button>
          {isWork && (
            <div className="text-center font-bold text-gray-700">
              Delete 키로 스티커를 지울 수 있습니다.
            </div>
          )}
        </div>

        {/* ================= 우측: 툴 팔레트 ================= */}
        <div className="w-full md:w-1/3 flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner">
          <div className="flex gap-4 mb-4 text-lg font-bold border-b pb-2">
            <span
              className={`cursor-pointer px-2 py-1 rounded transition ${isMode === "bg" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => {
                setIsWork(false);
                setIsMode("bg");
                setTargetSticker(null); // 다른 모드로 가면 선택 취소
              }}
            >
              배경색
            </span>
            <span className="text-gray-300">|</span>
            <span
              className={`cursor-pointer px-2 py-1 rounded transition ${isMode === "sticker" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => {
                setIsWork(true);
                setIsMode("sticker");
              }}
            >
              스티커
            </span>
          </div>

          <div className="overflow-y-auto max-h-[600px] pr-2">
            {/* --- 배경 모드 --- */}
            {isMode === "bg" && (
              <div>
                {Object.entries(bgColors).map(([theme, colors]) => (
                  <div key={theme} className="mb-6">
                    <div className="mb-2 font-bold capitalize">
                      {theme} 테마
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color, idx) => (
                        <div
                          key={idx}
                          className={`w-10 h-10 rounded-full cursor-pointer m-auto border-2 ${targetColor === color ? "border-blue-500 scale-110" : "border-gray-200 hover:scale-105"} transition-transform`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleSelectBg(color)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {Object.entries(patterns).map(([theme, items]) => (
                  <div key={theme} className="mb-6">
                    <div className="mb-2 font-bold">패턴</div>
                    <div className="grid grid-cols-4 gap-4">
                      {items.map((item) => {
                        const pid = `pattern_${item}`;
                        return (
                          <div
                            key={item}
                            className={`flex justify-center p-1 rounded cursor-pointer ${targetPattern === pid ? "bg-gray-300" : "hover:bg-gray-200"}`}
                            onClick={() => handleSelectPattern(pid)}
                          >
                            <img
                              ref={(el) => {
                                patternRefs.current[pid] = el;
                              }}
                              src={`/pattern/pattern_${item}.png`}
                              className="w-10 h-10 object-cover"
                              draggable="false"
                              alt={`pattern-${item}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- 스티커 모드 --- */}
            {isMode === "sticker" && (
              <div>
                {Object.entries(stickers).map(([theme, items]) => (
                  <div key={theme} className="mb-6">
                    <div className="mb-2 font-bold capitalize text-gray-600">
                      {theme.replace("_", " ")}
                    </div>
                    <div className="grid grid-cols-4 gap-4 bg-white p-3 rounded shadow-sm">
                      {items.map((item) => {
                        const sid = `${theme}_${item}`;
                        return (
                          <div
                            key={item}
                            className={`flex justify-center p-1 rounded cursor-pointer transition ${targetSticker === sid ? "border border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "border border-gray-100 hover:bg-gray-100"}`}
                            onClick={() => {
                              // 스티커를 토글 선택
                              setTargetSticker(
                                targetSticker === sid ? null : sid,
                              );
                            }}
                          >
                            <img
                              ref={(el) => {
                                stickerRefs.current[sid] = el;
                              }}
                              src={`/stickers/${theme}_${item}.png`}
                              className="w-10 h-10 object-contain pointer-events-none"
                              alt={`sticker-${sid}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <PreviewFrame
          onClose={() => setIsOpen(false)}
          columns={columns}
          rows={rows}
        />
      )}
    </div>
  );
}
