import type { FC } from "react";

interface ModalProps {
  title?: string;
  msg?: string;
  onClose: () => void;
  onSubmit: () => void;
}

const Modal: FC<ModalProps> = ({
  title = "작업 확인 창",
  msg = "정말 진행하시겠습니까?",
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center">
      <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="w-1/3" />
          <div className="w-1/3 text-center font-bold">{title}</div>
          <div className="w-1/3 flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex items-center justify-center py-10 text-lg">
          {msg}
        </div>

        {/* Footer */}
        <div className="flex">
          <button
            onClick={onClose}
            className="w-1/2 py-3 text-gray-500 border-t border-r hover:bg-gray-100 active:scale-95 transition"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="w-1/2 py-3 text-green-600 border-t hover:bg-green-50 active:scale-95 transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
