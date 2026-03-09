import { TitlePosition } from "@/src/types/title";

const PositionButton = ({
  pos,
  label,
  titlePosition,
  onClick,
}: {
  pos: TitlePosition;
  label: string;
  titlePosition: TitlePosition;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`h-10 border rounded-md flex items-center justify-center transition-all cursor-pointer ${
        titlePosition === pos
          ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
      }`}
      title={label}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          pos.includes("L")
            ? "mr-auto ml-1.5"
            : pos.includes("R")
              ? "ml-auto mr-1.5"
              : "mx-auto"
        } ${pos.includes("T") ? "mb-auto mt-1.5" : "mt-auto mb-1.5"}`}
      />
    </button>
  );
};

export default PositionButton;
