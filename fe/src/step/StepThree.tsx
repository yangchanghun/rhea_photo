import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useStore } from "@store/useStore"; // ✅ 실제 스토어 경로로 맞춰주세요
import BasicFrame from "@components/BasicFrame"; // ✅ 컴포넌트 경로 확인

interface Props {
  className?: string;
}

export default function StepThree({ className }: Props) {
  // ✅ Zustand 스토어 상태들 (기존 Vuex 대체)
  // * 참고: 스토어에 targets, targetList 상태가 정의되어 있어야 합니다.
  const {
    frame,
    images,
    setNext,
    targets = {}, // 프레임에 들어간 이미지 데이터 { 1: "data:image...", 2: "..." }
    setTargets,
    targetList = {}, // 프레임에 들어간 이미지 ID { 1: "17100000", 2: "17100001" }
    setTargetList,
  } = useStore();

  // 프레임 배열/행렬 계산
  const rows = parseInt(frame?.split("x")[0] || "2", 10);
  const columns = parseInt(frame?.split("x")[1] || "1", 10);
  const totalSlots = rows * columns;
  const isHorizontal = rows <= columns;

  // ✅ 컴포넌트 마운트 시 다음 단계(Next) 버튼 상태 초기화
  useEffect(() => {
    if (Object.keys(targets).length === totalSlots) {
      setNext(true);
    } else {
      setNext(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 이미지 클릭 (선택) 핸들러
  const handleSelectImage = (id: string, src: string) => {
    // 1. 이미 선택된 이미지라면 무시
    if (Object.values(targetList).includes(id)) return;

    const currentLen = Object.keys(targets).length;

    // 2. 꽉 찼는지 확인 (Vue의 this.$Utils.toast 대체)
    if (currentLen >= totalSlots) {
      alert("이미 모두 골랐어요."); // 프로젝트 내 Toast 컴포넌트로 변경하세요!
      return;
    }

    // 3. 비어있는 가장 빠른 슬롯(Index) 찾기 (Vue의 Queue 로직 대체)
    let nextSlot = -1;
    for (let i = 1; i <= totalSlots; i++) {
      if (!targets[i]) {
        nextSlot = i;
        break;
      }
    }

    // 4. 스토어 상태 업데이트
    if (nextSlot !== -1) {
      const newTargets = { ...targets, [nextSlot]: src };
      const newTargetList = { ...targetList, [nextSlot]: id };

      setTargets(newTargets);
      setTargetList(newTargetList);

      // 모두 다 골랐다면 Next 버튼 활성화
      if (Object.keys(newTargets).length === totalSlots) {
        setNext(true);
      } else {
        setNext(false);
      }
    }
  };

  return (
    <div
      className={`step-three w-full max-w-5xl mx-auto h-full ${className || ""}`}
    >
      <div className="flex flex-col md:flex-row h-full w-full p-0 m-0 items-center md:items-start gap-8">
        {/* ---------------- 좌측: 프레임 렌더링 영역 ---------------- */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          <div className="flex justify-center mb-6">
            {frame && <BasicFrame columns={columns} rows={rows} />}
          </div>
          <div className="flex justify-center text-center">
            <strong className="text-red-500 text-lg">
              우측의 이미지를 클릭해서 골라주세요.
            </strong>
          </div>
        </div>

        {/* ---------------- 우측: 촬영/업로드 이미지 리스트 ---------------- */}
        <div className="w-full md:w-1/3 flex flex-col h-full bg-gray-50 p-4 rounded-lg shadow-inner">
          <div className="text-center font-bold text-lg mb-2">
            이미지 리스트
          </div>
          <hr className="mb-4 border-gray-300" />

          <div className="images text-center overflow-y-auto overflow-x-hidden max-h-[500px] md:max-h-[600px] flex-1">
            {Object.entries(images).map(([id, src]) => {
              const isSelected = Object.values(targetList).includes(id);

              return (
                <div
                  key={id}
                  className="mb-6 relative flex flex-col items-center"
                >
                  <div
                    className="relative cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => handleSelectImage(id, src as string)}
                  >
                    {/* 선택됨 아이콘 */}
                    {isSelected && (
                      <CheckCircle className="absolute top-2 right-2 text-blue-500 w-8 h-8 z-10 bg-white rounded-full shadow" />
                    )}

                    {/* 이미지 */}
                    <img
                      id={id}
                      src={src as string}
                      alt={`Captured ${id}`}
                      draggable="false"
                      className={`m-auto object-cover rounded-md shadow-md border-2 
                        ${isSelected ? "border-blue-500 opacity-60 bg-gray-300" : "border-transparent"}
                        ${isHorizontal ? "w-[200px] h-[150px]" : "w-[150px] h-[200px]"}
                      `}
                    />
                  </div>
                  <hr className="w-3/4 border-gray-200 mt-6" />
                </div>
              );
            })}

            {/* 이미지가 없을 때의 예외 처리 */}
            {Object.keys(images).length === 0 && (
              <div className="text-gray-400 mt-10">
                선택할 이미지가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
