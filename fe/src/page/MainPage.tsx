import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@store/useStore";
import toast, { Toaster } from "react-hot-toast"; // ✅ 1. 토스트 라이브러리 불러오기

// 컴포넌트들 (경로 맞게 수정)
import NavBar from "@components/NavBar";
import FooterBar from "@components/FooterBar";
import StepOne from "@step/StepOne";
import StepTwo from "@step/StepTwo";
import StepThree from "@step/StepThree";

export default function MainPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const msg = [
    "액자를 골라보세요!",
    "가장 멋있고 예쁘게 찍어보세요",
    "어렵겠지만 몇 개만 골라주세요",
    "마음가는 대로 액자를 꾸며봐요!",
    "이번에는 사진을 꾸며볼까요",
    "마음에 드시나요?",
  ];

  // 🔥 next
  const nextStep = () => {
    const state = useStore.getState();

    // ✅ 2. alert() 대신 toast.error()를 사용해 에러 메시지를 띄웁니다!
    // 1단계 검증
    if (step === 0 && !state.frame) {
      toast.error("액자를 골라주세요.");
      return;
    }

    // 2단계 검증
    if (step === 1 && Object.keys(state.images).length < 6) {
      toast.error("사진 6장을 모두 찍거나 업로드해주세요.");
      return;
    }

    // 3단계 검증
    if (step === 2) {
      const totalSlots = state.table.rows * state.table.columns;
      if (Object.keys(state.targets).length < totalSlots) {
        toast.error("사진을 빈칸 없이 모두 골라주세요.");
        return;
      }
    }

    if (step === 5) return;

    setDirection("right");
    setStep((prev) => prev + 1);
  };

  // 🔥 prev
  const previousStep = () => {
    setDirection("left");
    if (step === 0) {
      navigate("/");
      return;
    }
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    const baseClass =
      "w-full animate-slide " +
      (direction === "right" ? "animate-from-right" : "animate-from-left");

    switch (step) {
      case 0:
        return <StepOne className={baseClass} />;
      case 1:
        return <StepTwo className={baseClass} />;
      case 2:
        return <StepThree className={baseClass} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white relative">
      {/* ✅ 3. Toaster 컴포넌트를 최상단에 둡니다. (여기서 토스트 UI가 그려집니다) */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000, // 2초 뒤에 사라짐
          style: {
            background: "#333",
            color: "#fff",
            fontWeight: "bold",
          },
        }}
      />

      {/* NAV */}
      <div className="fixed top-0 w-full z-[1000] bg-white">
        <NavBar
          msg={msg[step]}
          step={step}
          onNext={nextStep}
          onPrevious={previousStep}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 mt-[100px] overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-4">{renderStep()}</div>
      </div>

      {/* FOOTER */}
      <div className="h-[50px] bg-white">
        <FooterBar />
      </div>
    </div>
  );
}
