import { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@store/useStore";
import PreviewFrame from "@components/PreviewFrame";

interface Props {
  className?: string;
}

const FILTERS = [
  "normal",
  "grayscale",
  "invert",
  "sepia",
  "brownie",
  "brightness",
  "contrast",
  "saturation",
  "vibrance",
  "vintage",
  "pixelate",
  "blur",
];

const WIDTH_STEPS = [7, 10, 13, 16, 19];

export default function StepFive({ className }: Props) {
  const { frame, targets, setTargets } = useStore();

  const [canvasJsons, setCanvasJsons] = useState<Record<number, string>>({});

  const cols = parseInt(frame?.split("x")[0] || "1");
  const rows = parseInt(frame?.split("x")[1] || "2");

  const isHorizontal = cols <= rows;
  const cWidth = isHorizontal ? 600 : 450;
  const cHeight = isHorizontal ? 450 : 600;

  const totalImgs = Object.keys(targets).length || 1;
  const [currImg, setCurrImg] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);

  const [isMode, setIsMode] = useState<"filter" | "sticker" | "draw">("filter");
  const [targetSticker, setTargetSticker] = useState<string | null>(null);
  const [targetFilter, setTargetFilter] = useState<string>("normal");

  const [lineColor, setLineColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(10);
  const [targetLineWidth, setTargetLineWidth] = useState<string>("2");

  // ✅ 최신 상태 추적용 Ref (캔버스 초기화 시 복구용)
  const isModeRef = useRef(isMode);
  const targetStickerRef = useRef(targetSticker);
  const lineColorRef = useRef(lineColor);
  const lineWidthRef = useRef(lineWidth);

  useEffect(() => {
    isModeRef.current = isMode;
  }, [isMode]);
  useEffect(() => {
    targetStickerRef.current = targetSticker;
  }, [targetSticker]);
  useEffect(() => {
    lineColorRef.current = lineColor;
  }, [lineColor]);
  useEffect(() => {
    lineWidthRef.current = lineWidth;
  }, [lineWidth]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const filterCanvases = useRef<Record<string, fabric.Canvas>>({});
  const stickerRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const stickers = {
    cute_handdrawn: Array.from({ length: 6 }, (_, i) => i + 1),
    cute_natural_doodle: Array.from({ length: 12 }, (_, i) => i + 1),
    flower_leaf: Array.from({ length: 38 }, (_, i) => i + 1),
  };

  const getFilterObj = (name: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = fabric.Image.filters;
    switch (name) {
      case "grayscale":
        return new filters.Grayscale({ grayscale: 0.5 });
      case "invert":
        return new filters.Invert({ invert: 1 });
      case "sepia":
        return new filters.Sepia({ sepia: 0.5 });
      case "brownie":
        return new filters.Brownie({ brownie: 0.5 });
      case "brightness":
        return new filters.Brightness({ brightness: 0.1 });
      case "contrast":
        return new filters.Contrast({ contrast: 0.2 });
      case "saturation":
        return new filters.Saturation({ saturation: 0.5 });
      case "vibrance":
        return new filters.Vibrance({ vibrance: 0.5 });
      case "vintage":
        return new filters.Vintage({ vintage: 0.5 });
      case "pixelate":
        return new filters.Pixelate({ blocksize: 4 });
      case "blur":
        return new filters.Blur({ blur: 0.1 });
      default:
        return null;
    }
  };

  const saveWork = useCallback(() => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    canvas.discardActiveObject();
    canvas.renderAll();

    if (setTargets) {
      setTargets({
        ...targets,
        [currImg]: canvas.toDataURL({ format: "png", quality: 1 }),
      });
    }

    setCanvasJsons((prev) => ({
      ...prev,
      [currImg]: JSON.stringify(
        canvas.toObject([
          "id",
          "borderColor",
          "cornerColor",
          "cornerSize",
          "transparentCorners",
        ]),
      ),
    }));
  }, [currImg, targets, setTargets]);

  const saveWorkRef = useRef(saveWork);
  useEffect(() => {
    saveWorkRef.current = saveWork;
  }, [saveWork]);

  // --- [사진 캔버스 로드 및 상태 복구] ---
  const loadImgCanvas = useCallback(
    async (index: number) => {
      const canvas = fabricCanvas.current;
      if (!canvas) return;

      canvas.clear();

      // 🔥 핵심 복구 함수: 캔버스가 새로 로딩될 때마다 현재 리액트 상태(펜 설정)를 다시 주입합니다.
      const syncCanvasState = () => {
        canvas.isDrawingMode = isModeRef.current === "draw";
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = lineColorRef.current;
          canvas.freeDrawingBrush.width = lineWidthRef.current;
        }
        canvas.getObjects().forEach((obj) => {
          obj.selectable = isModeRef.current !== "draw";
          obj.evented = isModeRef.current !== "draw";
        });
        canvas.renderAll();
      };

      const savedJson = canvasJsons[index];
      if (savedJson) {
        canvas.loadFromJSON(savedJson, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bg: any = canvas.backgroundImage;
          setTargetFilter(
            bg && bg.filters && bg.filters.length > 0
              ? bg.filters[0].type.toLowerCase()
              : "normal",
          );

          syncCanvasState(); // JSON 불러온 후 모드 복구
        });
      } else {
        const rawImgUrl = targets[index];
        if (!rawImgUrl) return;

        fabric.Image.fromURL(rawImgUrl, (bgImg) => {
          canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width! / (bgImg.width || 1),
            scaleY: canvas.height! / (bgImg.height || 1),
          });
          setTargetFilter("normal");
          canvas.backgroundColor = "#FFFFFF";

          syncCanvasState(); // 새 이미지 불러온 후 모드 복구
          saveWork();
        });
      }
    },
    [targets, canvasJsons, saveWork],
  );

  const previewFilter = useCallback(() => {
    const rawImgUrl = targets[currImg];
    if (!rawImgUrl) return;

    FILTERS.forEach((filterName) => {
      const fCanvas = filterCanvases.current[filterName];
      if (!fCanvas) return;

      fabric.Image.fromURL(rawImgUrl, (bgImg) => {
        const filterObj = getFilterObj(filterName);
        if (filterObj) {
          bgImg.filters = [filterObj];
          bgImg.applyFilters();
        }
        fCanvas.setBackgroundImage(bgImg, fCanvas.renderAll.bind(fCanvas), {
          scaleX: fCanvas.width! / (bgImg.width || 1),
          scaleY: fCanvas.height! / (bgImg.height || 1),
        });
      });
    });
  }, [targets, currImg]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: cWidth,
      height: cHeight,
      backgroundColor: "#FFF",
      isDrawingMode: false,
    });
    fabricCanvas.current = canvas;

    canvas.freeDrawingBrush.color = lineColor;
    canvas.freeDrawingBrush.width = lineWidth;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("mouse:down", (e: any) => {
      const mode = isModeRef.current;
      const sid = targetStickerRef.current;

      if (e.target && e.target.type === "path")
        canvas.discardActiveObject().renderAll();

      if (mode === "sticker" && sid && e.pointer) {
        const imgElement = stickerRefs.current[sid];
        if (!imgElement) return;

        fabric.Image.fromURL(imgElement.src, (img) => {
          img.set({
            left: e.pointer.x,
            top: e.pointer.y,
            originX: "center",
            originY: "center",
            borderColor: "red",
            cornerColor: "green",
            cornerSize: 10,
            transparentCorners: false,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          setTargetSticker(null);
          // ❌ 기존: saveWork();
          saveWorkRef.current(); // ✅ 수정
        });
      }
    });

    canvas.on("mouse:up", (e) => {
      if (isModeRef.current === "draw")
        saveWorkRef.current(); // ✅ 수정
      else if (e.target) {
        e.target.opacity = 1;
        canvas.renderAll();
      }
    });

    // canvas.on("selection:cleared", () => saveWork());
    canvas.on("selection:cleared", () => saveWorkRef.current()); // ✅ 수정
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toUpperCase() === "DELETE" ||
        e.key.toUpperCase() === "BACKSPACE"
      ) {
        const targetObj = canvas.getActiveObject();
        if (targetObj) {
          canvas.remove(targetObj);
          canvas.renderAll();
          // ❌ 기존: saveWork();
          saveWorkRef.current(); // ✅ 수정
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.dispose();
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cWidth, cHeight]);

  useEffect(() => {
    loadImgCanvas(currImg);
    setTimeout(() => {
      previewFilter();
    }, 100);
  }, [currImg, loadImgCanvas, previewFilter]);

  useEffect(() => {
    if (!fabricCanvas.current) return;
    const canvas = fabricCanvas.current;

    canvas.isDrawingMode = isMode === "draw";

    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      obj.selectable = isMode !== "draw";
      obj.evented = isMode !== "draw";
    });
    canvas.discardActiveObject().renderAll();
  }, [isMode]);

  useEffect(() => {
    if (!fabricCanvas.current) return;
    fabricCanvas.current.freeDrawingBrush.color = lineColor;
    fabricCanvas.current.freeDrawingBrush.width = lineWidth;
  }, [lineColor, lineWidth]);

  const handleFilterSelect = (filterName: string) => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    setTargetFilter(filterName);
    const rawImgUrl = targets[currImg];
    if (!rawImgUrl) return;

    fabric.Image.fromURL(rawImgUrl, (bgImg) => {
      if (filterName !== "normal") {
        const filterObj = getFilterObj(filterName);
        if (filterObj) {
          bgImg.filters = [filterObj];
          bgImg.applyFilters();
        }
      }
      canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / (bgImg.width || 1),
        scaleY: canvas.height! / (bgImg.height || 1),
      });
      saveWork();
    });
  };

  const handleClearPath = () => {
    const canvas = fabricCanvas.current;
    if (!canvas) return;
    const paths = canvas.getObjects().filter((obj) => obj.type === "path");
    paths.forEach((path) => canvas.remove(path));
    canvas.renderAll();
    saveWork();
  };

  const nextImg = () => {
    if (currImg < totalImgs) {
      saveWork();
      setCurrImg(currImg + 1);
    }
  };
  const prevImg = () => {
    if (currImg > 1) {
      saveWork();
      setCurrImg(currImg - 1);
    }
  };

  return (
    <div className={`step-five ${className || ""}`}>
      <div className="flex flex-col md:flex-row m-0 p-0 gap-8">
        {/* ================= 좌측: 단일 캔버스 영역 ================= */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          <div className="w-full flex justify-end items-center mb-4 px-4 gap-4">
            <div className="flex items-center gap-2 text-gray-500 italic">
              <AlertCircle size={18} />
              <small>스티커, 그리기 등을 자유롭게 꾸며보세요!</small>
            </div>
            <button
              className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
              onClick={() => {
                saveWork();
                setIsOpen(true);
              }}
            >
              미리보기
            </button>
          </div>

          <div className="flex justify-center items-center shadow-[0.5px_0.5px_1.5px_black] bg-white mb-6">
            <canvas ref={canvasRef} />
          </div>

          {/* 사진 네비게이션 */}
          <div className="flex w-full justify-center items-center gap-6 mt-4">
            <button
              onClick={prevImg}
              disabled={currImg === 1}
              className="text-gray-600 hover:text-black disabled:opacity-30 transition"
            >
              <ChevronLeft size={48} />
            </button>
            <span className="text-2xl font-bold w-24 text-center">
              {currImg} / {totalImgs}
            </span>
            <button
              onClick={nextImg}
              disabled={currImg === totalImgs}
              className="text-gray-600 hover:text-black disabled:opacity-30 transition"
            >
              <ChevronRight size={48} />
            </button>
          </div>
        </div>

        {/* ================= 우측: 툴 팔레트 ================= */}
        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-xl border shadow-inner">
          <div className="flex border-b mb-6 text-lg font-bold">
            <button
              className={`flex-1 py-2 ${isMode === "filter" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => setIsMode("filter")}
            >
              필터
            </button>
            <button
              className={`flex-1 py-2 ${isMode === "sticker" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => setIsMode("sticker")}
            >
              스티커
            </button>
            <button
              className={`flex-1 py-2 ${isMode === "draw" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              onClick={() => setIsMode("draw")}
            >
              그리기
            </button>
          </div>

          <div className="h-[600px] overflow-y-auto pr-2">
            {/* --- 필터 모드 --- */}
            {isMode === "filter" && (
              <div className="grid grid-cols-2 gap-4">
                {FILTERS.map((filter) => (
                  <div
                    key={filter}
                    className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer transition ${targetFilter === filter ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "bg-white hover:bg-gray-100"}`}
                    onClick={() => handleFilterSelect(filter)}
                  >
                    {/* ✅ 1. 기존 <canvas> 전체 삭제 후 <img> 태그 삽입 */}
                    <img
                      src="/img/filter-sample.jpg" // 지정된 경로
                      alt={`${filter} sample`}
                      className="mb-2 border bg-gray-200 object-cover rounded-md"
                      style={{
                        // 이전 코드에서 정의한 반응형 크기 유지
                        width: isHorizontal ? 100 : 75,
                        height: isHorizontal ? 75 : 100,
                      }}
                    />

                    <span className="text-sm font-semibold capitalize">
                      {filter}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* --- 스티커 모드 --- */}
            {isMode === "sticker" && (
              <div>
                {Object.entries(stickers).map(([theme, items]) => (
                  <div key={theme} className="mb-6">
                    <p className="font-bold mb-3 text-gray-600 uppercase text-xs tracking-widest">
                      {theme.replace(/_/g, " ")}
                    </p>
                    <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded shadow-sm border">
                      {items.map((item) => {
                        const sid = `${theme}_${item}`;
                        return (
                          <div
                            key={sid}
                            className={`p-1 border rounded-lg cursor-pointer hover:bg-blue-50 transition ${targetSticker === sid ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}
                            onClick={() =>
                              setTargetSticker(
                                targetSticker === sid ? null : sid,
                              )
                            }
                          >
                            <img
                              ref={(el) => {
                                stickerRefs.current[sid] = el;
                              }}
                              src={`/stickers/${theme}_${item}.png`}
                              className="w-full h-auto object-contain pointer-events-none"
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

            {/* --- 그리기 모드 --- */}
            {isMode === "draw" && (
              <div className="bg-white p-5 rounded-lg shadow-sm border">
                <div className="mb-6">
                  <p className="font-bold mb-3 text-gray-700">굵 기</p>
                  <div className="flex justify-between items-center px-4">
                    {["1", "2", "3", "4", "5"].map((step, idx) => (
                      <div
                        key={step}
                        className={`cursor-pointer p-2 rounded-lg transition-all ${targetLineWidth === step ? "bg-gray-200 ring-2 ring-gray-400" : "hover:bg-gray-100"}`}
                        onClick={() => {
                          setTargetLineWidth(step);
                          setLineWidth(WIDTH_STEPS[idx]);
                        }}
                      >
                        <div
                          className="bg-black rounded-full"
                          style={{
                            width: `${10 + idx * 5}px`,
                            height: `${10 + idx * 5}px`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="font-bold mb-3 text-gray-700">색 상</p>
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-full h-12 cursor-pointer rounded border border-gray-300"
                  />
                </div>

                <div className="text-center">
                  <button
                    className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition"
                    onClick={handleClearPath}
                  >
                    처음으로 (모든 선 지우기)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <PreviewFrame
          onClose={() => setIsOpen(false)}
          columns={cols}
          rows={rows}
        />
      )}
    </div>
  );
}
