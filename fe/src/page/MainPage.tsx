import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 컴포넌트들 (너 경로 맞게 수정)
import NavBar from "@components/NavBar";
import FooterBar from "@components/FooterBar";
import StepOne from "@step/StepOne";
import StepTwo from "@step/StepTwo";
// import StepOne from "@/pages/steps/StepOne";
// import StepTwo from "@/pages/steps/StepTwo";
// import StepThree from "@/pages/steps/StepThree";
// import StepFour from "@/pages/steps/StepFour";
// import StepFive from "@/pages/steps/StepFive";
// import StepResult from "@/pages/steps/StepResult";

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
    setDirection("right");

    // 👉 Vuex → 나중에 Zustand로 바꿔야됨
    const canNext = true; // 임시

    if (step === 0 && !canNext) {
      alert("액자를 골라주세요.");
      return;
    } else if (step === 1 && !canNext) {
      alert("사진이 부족합니다.");
      return;
    } else if (step === 2 && !canNext) {
      alert("사진을 모두 골라주세요.");
      return;
    }

    if (step === 5 || !canNext) return;

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

  // 🔥 step 렌더링
  const renderStep = () => {
    const baseClass =
      "w-full animate-slide " +
      (direction === "right" ? "animate-from-right" : "animate-from-left");

    switch (step) {
      case 0:
        return <StepOne className={baseClass} />;
      case 1:
        return <StepTwo className={baseClass} />;
      // case 2:
      //   return <StepThree className={baseClass} />;
      // case 3:
      //   return <StepFour className={baseClass} />;
      // case 4:
      //   return <StepFive className={baseClass} />;
      // default:
      //   return <StepResult className={baseClass} onPrevious={previousStep} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
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
      <div className="flex-1 mt-[100px] overflow-y-auto">
        <div className="container mx-auto px-4">{renderStep()}</div>
      </div>

      {/* FOOTER */}
      <div className="h-[50px] bg-white">
        <FooterBar />
      </div>
    </div>
  );
}
