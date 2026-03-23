import React, { useRef } from "react";
import { Upload, X } from "lucide-react";

interface PhotoUploadBoardProps {
  images: Record<string, string>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (targetId: string) => void;
  onReset: () => void;
}

export default function PhotoUploadBoard({
  images,
  onUpload,
  onRemove,
  onReset,
}: PhotoUploadBoardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCount = Object.keys(images).length;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="m-auto h-[450px] w-[600px] flex flex-col">
      {!imageCount ? (
        <div
          className="h-full bg-white shadow-md rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-50 transition"
          onClick={handleUploadClick}
        >
          <Upload className="w-20 h-20 mb-4 text-gray-500" />
          <div className="text-xl font-bold">사진 올리기</div>
        </div>
      ) : (
        <div className="h-full shadow-lg bg-gray-50 p-4 rounded-lg flex flex-col">
          <div className="grid grid-rows-2 gap-4 h-[90%]">
            {[0, 1].map((rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((colIdx) => {
                  const imgIndex = rowIdx * 3 + colIdx;
                  const keys = Object.keys(images);
                  const values = Object.values(images);
                  const imgUrl = values[imgIndex];
                  const imgKey = keys[imgIndex];

                  return imgUrl ? (
                    <div
                      key={colIdx}
                      className="relative bg-white shadow rounded flex items-center justify-center overflow-hidden"
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={imgUrl}
                        alt={`Upload ${imgIndex}`}
                      />
                      <div
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-1 cursor-pointer"
                        onClick={() => onRemove(imgKey)}
                      >
                        <X className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={colIdx}
                      className="bg-white shadow rounded border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition"
                      onClick={handleUploadClick}
                    >
                      <Upload className="w-10 h-10 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {imageCount === 6 && (
            <div className="text-center mt-4 h-[10%] flex items-center justify-center">
              <button
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold transition"
                onClick={onReset}
              >
                초기화
              </button>
            </div>
          )}
        </div>
      )}

      {imageCount < 6 && (
        <div className="text-center mt-4 text-gray-600">
          카메라가 없다면 가지고 계신 사진을 6장까지 넣어주세요!
        </div>
      )}

      <input
        ref={fileInputRef}
        onChange={onUpload}
        type="file"
        className="hidden"
        multiple
        accept="image/*"
      />
    </div>
  );
}
