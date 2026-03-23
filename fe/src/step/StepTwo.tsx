import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useStore } from "@store/useStore"; // ✅ 전역 스토어 불러오기
import CameraBooth from "@components/steptwo/CameraBooth";
import PhotoUploadBoard from "@components/steptwo/PhotoUploadBoard";

// ✅ Props 인터페이스 추가
interface Props {
  className?: string;
}

export default function StepTwo({ className }: Props) {
  // ✅ useState 대신 useStore에서 frame과 설정할 액션들 가져오기
  const { frame } = useStore();

  const [images, setImages] = useState<Record<string, string>>({});
  const [canPhoto, setCanPhoto] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setCanPhoto(true);
        setIsLoading(false);
      })
      .catch(() => {
        setCanPhoto(false);
        setIsLoading(false);
      });
  }, []);

  const handleCapture = (imageData: string) => {
    const id = (Date.now() + Math.random()).toString();
    setImages((prev) => ({ ...prev, [id]: imageData }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Object.keys(images).length >= 6 || !e.target.files) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (Object.keys(images).length >= 6) break;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          const id = (Date.now() + Math.random()).toString();
          setImages((prev) => ({
            ...prev,
            [id]: event.target!.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (targetId: string) => {
    setImages((prev) => {
      const newImages = { ...prev };
      delete newImages[targetId];
      return newImages;
    });
  };

  const handleResetImages = () => {
    if (window.confirm("찍은 사진들을 모두 초기화 하시겠어요?")) {
      setImages({});
    }
  };

  return (
    // ✅ 전달받은 className을 기존 클래스와 병합
    <div className={`step-two ${className || ""}`}>
      <style>{`
        .mirror { transform: scaleX(-1); }
        .animate-pop { animation: pop 1s ease; }
        .animate-flash { animation: flashAnim 0.15s ease; }
        @keyframes flashAnim { 0% { opacity: 0.9; } 100% { opacity: 0; } }
        @keyframes pop { 
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 
        }
      `}</style>

      <div className="mb-12 flex justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-xl h-[600px]">
            <Loader2 className="animate-spin w-10 h-10 mb-2" />
            <small>카메라 확인 중</small>
          </div>
        ) : canPhoto ? (
          <CameraBooth
            frame={frame || "2x1"} // ✅ 스토어에서 가져온 프레임 적용 (방어 코드로 기본값 추가)
            imageCount={Object.keys(images).length}
            onCapture={handleCapture}
            onResetRequest={handleResetImages}
          />
        ) : (
          <PhotoUploadBoard
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleRemoveImage}
            onReset={handleResetImages}
          />
        )}
      </div>
    </div>
  );
}
