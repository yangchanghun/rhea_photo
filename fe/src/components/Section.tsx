interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-10">
      {/* 제목 */}
      <div className="mb-3 pl-3 text-left text-xl font-bold">{title}</div>

      {/* 컨텐츠 */}
      <div className="flex flex-wrap justify-center gap-4">{children}</div>

      <hr className="mt-6" />
    </div>
  );
}
