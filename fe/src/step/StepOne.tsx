import { useEffect, useState } from "react";
import { useStore } from "@store/useStore";
import Section from "@components/Section";
import FrameItem from "@components/FrameItem";

interface Props {
  className?: string;
}

export default function StepOne({ className }: Props) {
  const { frame, setFrame, setNext, setTable, resetState } = useStore();

  const [targetFrame, setTargetFrame] = useState<string | null>(null);

  const selectFrame = (id: string) => {
    if (targetFrame === id) {
      setTargetFrame(null);
      setNext(false);

      setTable({ rows: 2, columns: 1 });
    } else {
      setTargetFrame(id);
      setNext(true);

      const [columns, rows] = id.split("x").map(Number);

      setTable({ columns, rows });
    }
  };
  // ✅ mounted
  useEffect(() => {
    resetState();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargetFrame(frame);

    if (!frame) setNext(false);
    else setNext(true);
  }, []);

  // ✅ beforeDestroy
  useEffect(() => {
    return () => {
      if (!targetFrame) return;
      setFrame(targetFrame);
    };
  }, [targetFrame]);

  // ✅ 선택

  return (
    <div className={`text-center pb-12 ${className}`}>
      {/* 선택 상태 */}
      <div className="mb-6 bg-gray-500 text-white rounded-lg px-6 py-3 inline-block text-xl">
        프레임: {targetFrame ?? "선택 안함"}
      </div>

      {/* 설명 */}
      <div className="mb-6 text-right font-bold">
        세로가 긴 액자는 4:3 비율, 가로가 긴 액자는 3:4 비율입니다.
      </div>

      {/* 2 Cuts */}
      <Section title="2 Cuts">
        <FrameItem
          active={targetFrame === "1x2"}
          img="/frame/1_2.png"
          onClick={() => selectFrame("1x2")}
          vertical
        />
        <FrameItem
          active={targetFrame === "2x1"}
          img="/frame/2_1.png"
          onClick={() => selectFrame("2x1")}
        />
      </Section>

      {/* 3 Cuts */}
      <Section title="3 Cuts">
        <FrameItem
          active={targetFrame === "1x3"}
          img="/frame/1_3.png"
          onClick={() => selectFrame("1x3")}
          vertical
        />
        <FrameItem
          active={targetFrame === "3x1"}
          img="/frame/3_1.png"
          onClick={() => selectFrame("3x1")}
        />
      </Section>

      {/* 4 Cuts */}
      <Section title="4 Cuts">
        <FrameItem
          active={targetFrame === "1x4"}
          img="/frame/1_4.png"
          onClick={() => selectFrame("1x4")}
          vertical
        />
        <FrameItem
          active={targetFrame === "2x2"}
          img="/frame/2_2.png"
          onClick={() => selectFrame("2x2")}
        />
        <FrameItem
          active={targetFrame === "4x1"}
          img="/frame/4_1.png"
          onClick={() => selectFrame("4x1")}
        />
      </Section>

      {/* 6 Cuts */}
      <Section title="6 Cuts">
        <FrameItem
          active={targetFrame === "2x3"}
          img="/frame/2_3.png"
          onClick={() => selectFrame("2x3")}
          vertical
        />
        <FrameItem
          active={targetFrame === "3x2"}
          img="/frame/3_2.png"
          onClick={() => selectFrame("3x2")}
        />
      </Section>
    </div>
  );
}
