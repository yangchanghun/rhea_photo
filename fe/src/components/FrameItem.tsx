interface FrameItemProps {
  img: string;
  onClick: () => void;
  active: boolean;
  vertical?: boolean;
}

export default function FrameItem({
  img,
  onClick,
  active,
  vertical,
}: FrameItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 m-auto rounded-lg cursor-pointer transition active:scale-95
        ${active ? "bg-gray-400" : ""}
      `}
    >
      <img
        src={img}
        draggable={false}
        className={`shadow-md ${vertical ? "h-[300px]" : "w-[300px]"}`}
      />
    </div>
  );
}
