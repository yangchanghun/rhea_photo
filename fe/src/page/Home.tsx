import { useStore } from "@store/useStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { resetState } = useStore();
  const init = () => {
    // Vuex → (Redux/Zustand 등으로 바꿔야 함)
    // 일단 예시로 localStorage 초기화
    // localStorage.clear();

    // 👉 만약 Zustand면
    resetState();
  };

  // mounted → useEffect
  useEffect(() => {
    init();
  }, []);

  return (
    <div
      onClick={() => {
        init();
        navigate("/main");
      }}
      className="w-full h-screen flex justify-center items-center bg-black text-white cursor-pointer"
    >
      <div className="text-center select-none">
        {/* 제목 */}
        <div className="text-[60px] font-bold">레아포토</div>

        {/* 서브타이틀 */}
        <div className="text-[25px] mb-10">
          무제한으로 원하는 모습을 찍고 꾸미세요!
        </div>

        {/* 클릭 안내 */}
        <span className="text-lg opacity-80 animate-pulse">Click to Start</span>
      </div>
    </div>
  );
}
