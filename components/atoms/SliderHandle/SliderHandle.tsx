import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

type SliderHandleProps = {
  percent: number;
  zIndex: number;
  label: string;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  valueText: string;
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

const SliderHandle = ({
  percent,
  zIndex,
  label,
  valueNow,
  valueMin,
  valueMax,
  valueText,
  isDragging,
  onPointerDown,
  onKeyDown,
}: SliderHandleProps) => {
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={valueNow}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      style={{ left: `${percent}%`, zIndex }}
      className={cn(
        "group absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-3 w-3 rounded-none bg-black transition-transform duration-150 group-hover:scale-125",
          isDragging && "scale-125",
        )}
      />
    </div>
  );
};

export default SliderHandle;
