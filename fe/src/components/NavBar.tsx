interface NavBarProps {
  msg?: string;
  step: number;
  onNext: () => void;
  onPrevious: () => void;
}

export default function NavBar({
  msg = "Pick the Memory",
  step,
  onNext,
  onPrevious,
}: NavBarProps) {
  return (
    <div className="h-[75px] border-b flex items-center bg-white">
      <div className="w-full flex items-center px-4">
        {/* 이전 버튼 */}
        <div className="w-1/3 flex items-center">
          <button
            onClick={onPrevious}
            className="flex items-center gap-1 text-lg active:scale-95 transition"
          >
            <span>‹</span>
            <strong>이전</strong>
          </button>
        </div>

        {/* 제목 */}
        <div className="w-1/3 text-center text-[25px] font-bold">{msg}</div>

        {/* 다음 버튼 */}
        <div className="w-1/3 flex justify-end items-center">
          {step !== 5 && (
            <button
              onClick={onNext}
              className="flex items-center gap-1 text-lg active:scale-95 transition"
            >
              <strong>다음</strong>
              <span>›</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
