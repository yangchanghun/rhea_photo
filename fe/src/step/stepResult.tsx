import { useRef } from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom"; // 라우터 사용 (설정에 따라 변경 가능)
import { useStore } from "@store/useStore";
import ResultFrame from "@components/ResultFrame";

// ✅ TypeScript: AndroidBridge 전역 객체 타입 정의
declare global {
  interface Window {
    AndroidBridge?: {
      printImage: (base64: string) => void;
      saveImage: (base64: string) => void;
    };
  }
}

interface Props {
  className?: string;
}

export default function StepResult({ className }: Props) {
  const sizeColumn = useStore((state) => state.size);
  // 📐 프레임 사이즈 매핑 객체 (가로/세로 크기)
  const FRAME_SIZES: Record<string, { w: number; h: number }> = {
    "1x1": { w: 400, h: sizeColumn },
    "1x2": { w: 320, h: sizeColumn },
    "1x3": { w: 220, h: sizeColumn },
    "1x4": { w: 180, h: sizeColumn },
    "2x1": { w: 520, h: sizeColumn },
    "2x2": { w: 620, h: sizeColumn },
    "2x3": { w: 420, h: sizeColumn },
    "3x1": { w: 525, h: sizeColumn },
    "3x2": { w: 525, h: sizeColumn },
    "4x1": { w: 560, h: sizeColumn },
  };

  const { table, resetState } = useStore();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);

  // const setSize = useStore((state) => state.setSize);
  const rows = table?.rows || 2;
  const columns = table?.columns || 1;
  const frameKey = `${columns}x${rows}`;
  const size = FRAME_SIZES[frameKey] || FRAME_SIZES["1x1"];

  // --- [인쇄 하기] ---

  const printClick = async () => {
    console.log("printClick clicked");
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const base64 = canvas.toDataURL("image/png");

      // 🔥 안드로이드 환경 (키오스크)
      if (window.AndroidBridge && window.AndroidBridge.printImage) {
        const pureBase64 = base64.split(",")[1];
        console.log("안드로이드 프린터로 전송...");
        window.AndroidBridge.printImage(pureBase64);
      }
      // 🔥 PC 일반 브라우저 환경
      else {
        console.log("PC 브라우저 인쇄 모드...");
        // 새 창을 열고 캡처된 이미지를 딱 맞게 넣어서 인쇄창 호출!
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
    <html>
      <head>
        <title>인생네컷 인쇄</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
            background: #fff;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          img {
            display: block;
            width: auto;
            max-width: 190mm;
            max-height: 270mm;
            object-fit: contain;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <img src="${base64}" onload="window.print(); window.close();" />
      </body>
    </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (error) {
      console.error("Print error:", error);
    }
  };

  // --- [저장 하기] ---
  const saveResult = async () => {
    if (!resultRef.current) return;

    try {
      // 📸 인쇄하기와 100% 동일하게 resultRef(사진 영역) 캡처
      const canvas = await html2canvas(resultRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const base64 = canvas.toDataURL("image/png");
      const pureBase64 = base64.split(",")[1];

      if (window.AndroidBridge && window.AndroidBridge.saveImage) {
        console.log("갤러리/파일 저장 시작...");
        window.AndroidBridge.saveImage(pureBase64); // 안드로이드 저장 로직 호출
      } else {
        const a = document.createElement("a");
        a.href = base64;
        a.download = "Image.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("saveResult error:", error);
    }
  };
  // --- [다시 하기] ---
  const handleReset = () => {
    resetState(); // 스토어 데이터 초기화 (필요 시)
    navigate("/"); // 메인(홈) 화면으로 이동
  };

  return (
    <div className={`step-result ${className || ""}`}>
      {/* 상단 버튼 영역 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
          onClick={saveResult}
        >
          저 장 하 기
        </button>
        <button
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition"
          onClick={printClick}
        >
          인 쇄 하 기
        </button>
        <button
          className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow hover:bg-gray-600 transition"
          onClick={handleReset}
        >
          다 시 하 기
        </button>
      </div>

      {/* 결과 프레임 영역 */}
      <div className="mb-12 flex justify-center">
        <div
          ref={resultRef}
          className="outter-frame relative bg-white shadow-xl"
          style={{ width: size.w, height: size.h }}
        >
          <ResultFrame rows={rows} columns={columns} />
        </div>
      </div>

      {/* ✅ 인쇄 전용 CSS (Vue의 @media print와 동일) */}
      <style>{`
        @media print {
          @page {
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          body * {
            display: none !important;
          }
          .outter-frame,
          .outter-frame * {
            display: block !important;
          }
          .outter-frame {
            position: fixed;
            inset: 0;
            margin: auto;
            width: auto;
            height: auto;
            box-shadow: none !important; /* 인쇄 시 그림자 제거 */
          }
        }
      `}</style>
    </div>
  );
}
