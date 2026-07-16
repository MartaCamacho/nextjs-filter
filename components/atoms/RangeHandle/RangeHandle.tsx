import type {
  AriaAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { joinClassNames } from "@/lib/utils";

export type RangeHandleAriaProps = Required<
  Pick<
    AriaAttributes,
    "aria-label" | "aria-valuemin" | "aria-valuemax" | "aria-valuetext"
  >
>;

type RangeHandleProps = {
  percent: number;
  zIndex: number;
  valueNow: number;
  isDragging: boolean;
  ariaProps: RangeHandleAriaProps;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

const RangeHandle = ({
  percent,
  zIndex,
  valueNow,
  isDragging,
  ariaProps,
  onPointerDown,
  onKeyDown,
}: RangeHandleProps) => {
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-orientation="horizontal"
      aria-valuenow={valueNow}
      {...ariaProps}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      style={{ left: `${percent}%`, zIndex }}
      className={joinClassNames(
        "group absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-none",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <span
        aria-hidden="true"
        className={joinClassNames(
          "h-3 w-3 rounded-none bg-black transition-transform duration-150 group-hover:scale-125 motion-reduce:transition-none",
          isDragging && "scale-125",
        )}
      />
    </div>
  );
};

export default RangeHandle;
