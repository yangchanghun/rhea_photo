import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeftRight, Trash2, Plus } from "lucide-react";

interface CameraBoothProps {
  imageCount: number;
  onCapture: (imageData: string) => void;
  onResetRequest: () => void;
  frame: string;
}

export default function CameraBooth({
  imageCount,
  onCapture,
  frame,
}: CameraBoothProps) {
  const rows = parseInt(frame.split("x")[0], 10);
  const columns = parseInt(frame.split("x")[1], 10);
  const isHorizontal = rows <= columns;

  const [isPhotoTaken, setIsPhotoTaken] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isAutoShooting, setIsAutoShooting] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [isMirror, setIsMirror] = useState<boolean>(false);

  // 명시적 Ref 타입 지정
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shutterSoundRef = useRef<HTMLAudioElement>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 1. 무한 루프 방지용 Ref: 항상 최신 이미지 갯수를 추적합니다.
  const imageCountRef = useRef(imageCount);

  useEffect(() => {
    imageCountRef.current = imageCount;
    // 6장이 꽉 차면 진행 중이던 타이머를 강제 종료합니다.
    if (imageCount >= 6) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAutoShooting(false);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
  }, [imageCount]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        const selectedCamera =
          cameras.find(
            (c) =>
              c.label.toLowerCase().includes("usb") ||
              c.label.toLowerCase().includes("camera"),
          ) || cameras[cameras.length - 1];

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera?.deviceId,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const captureAndSave = useCallback(() => {
    if (!canvasRef.current || !cameraRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    const [width, height] = isHorizontal ? [600, 450] : [450, 600];

    context.save();
    if (isMirror) {
      context.scale(-1, 1);
      context.drawImage(cameraRef.current, -width, 0, width, height);
    } else {
      context.drawImage(cameraRef.current, 0, 0, width, height);
    }
    context.restore();

    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    shutterSoundRef.current?.play().catch((e) => console.log(e));

    const image = canvasRef.current
      .toDataURL("image/jpeg")
      .replace("image/jpeg", "image/octet-stream");

    onCapture(image);
  }, [isMirror, isHorizontal, onCapture]);

  // ✅ 2. 최신의 startAutoShot 함수를 호출하기 위한 Ref
  const startAutoShotRef = useRef<(() => void) | null>(null);

  const startAutoShot = useCallback(() => {
    // 💥 현재 진짜 최신 갯수를 확인 (6장이면 실행 거부)
    if (imageCountRef.current >= 6) {
      setIsAutoShooting(false);
      return;
    }

    setIsAutoShooting(true);
    setCountdown(5);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current)
            clearInterval(countdownTimerRef.current);

          captureAndSave();

          // 💥 1초 뒤에 다음 촬영 예약할 때도 최신 갯수 확인!
          setTimeout(() => {
            if (imageCountRef.current < 6) {
              startAutoShotRef.current?.();
            } else {
              setIsAutoShooting(false);
            }
          }, 1000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [captureAndSave]);

  // startAutoShot 함수가 바뀔 때마다 Ref를 최신화
  useEffect(() => {
    startAutoShotRef.current = startAutoShot;
  }, [startAutoShot]);

  const handleActionClick = () => {
    if (isPhotoTaken) setIsPhotoTaken(false);
    else if (!isAutoShooting && imageCount < 6) startAutoShot();
  };

  return (
    <div
      className={`relative bg-black flex ${isHorizontal ? "flex-row" : "flex-col"}`}
    >
      <div
        className={`flex items-center justify-center text-white text-xl text-center ${isHorizontal ? "w-[50px] h-full flex-col p-2" : "h-[50px] w-full"}`}
      >
        {isPhotoTaken
          ? "마음에 들면 다음으로!"
          : imageCount < 6
            ? `${6 - imageCount}장 남았어요!`
            : "이제 꾸미러 가볼까요?"}
      </div>

      <div
        className={`relative ${isHorizontal ? "w-[600px] h-[450px]" : "w-[450px] h-[600px]"}`}
      >
        <video
          ref={cameraRef}
          className={`object-cover w-full h-full ${isPhotoTaken ? "hidden" : "block"} ${isMirror ? "mirror" : ""}`}
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className={`object-cover w-full h-full ${isPhotoTaken ? "block" : "hidden"}`}
          width={isHorizontal ? 600 : 450}
          height={isHorizontal ? 450 : 600}
        />
        {countdown > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] text-white font-bold z-10 animate-pop">
            {countdown}
          </div>
        )}
        {flash && (
          <div className="absolute inset-0 bg-white opacity-90 animate-flash z-20"></div>
        )}
      </div>

      <audio ref={shutterSoundRef} src="/sounds/shutter.mp3" />

      <div
        className={`relative flex items-center ${isHorizontal ? "w-[100px] flex-col justify-start pt-4" : "h-[100px] w-full justify-start pl-4"}`}
      >
        <div
          className={`flex ${isHorizontal ? "flex-col" : "flex-row"} gap-4 z-10`}
        >
          <ArrowLeftRight
            className="text-white cursor-pointer w-7 h-7"
            onClick={() => setIsMirror(!isMirror)}
          />
          {isPhotoTaken && (
            <Trash2
              className="text-white cursor-pointer w-8 h-8"
              onClick={() => setIsPhotoTaken(false)}
            />
          )}
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex justify-center items-center">
          {imageCount < 6 && (
            <button
              className={`w-[60px] h-[60px] rounded-full bg-white border border-black flex items-center justify-center ${isAutoShooting ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleActionClick}
              disabled={isAutoShooting}
            >
              <div className="w-[50px] h-[50px] rounded-full border-2 border-gray-400 flex items-center justify-center">
                {isPhotoTaken && <Plus className="w-5 h-5 text-black" />}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
