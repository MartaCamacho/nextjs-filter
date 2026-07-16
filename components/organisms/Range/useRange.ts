import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { RangeHandleAriaProps } from "@/components/atoms/RangeHandle";
import { clamp } from "@/lib/utils";
import type { RangeAdapter, SelectedRange } from "@/types/range";

export type HandleKey = "min" | "max";

type UseRangeProps = {
  adapter: RangeAdapter;
  value: SelectedRange;
  onChange: (next: SelectedRange) => void;
  minLabel: string;
  maxLabel: string;
  formatValue: (value: number) => string;
};

type HandleRenderProps = {
  percent: number;
  zIndex: number;
  valueNow: number;
  isDragging: boolean;
  ariaProps: RangeHandleAriaProps;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

type UseRangeResult = {
  trackRef: RefObject<HTMLDivElement | null>;
  minPercent: number;
  maxPercent: number;
  getHandleProps: (handle: HandleKey) => HandleRenderProps;
};

export const useRange = ({
  adapter,
  value,
  onChange,
  minLabel,
  maxLabel,
  formatValue,
}: UseRangeProps): UseRangeResult => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<HandleKey | null>(
    null,
  );
  const [activeHandle, setActiveHandle] = useState<HandleKey>("min");

  const setValueForHandle = useCallback(
    (handle: HandleKey, rawValue: number) => {
      if (handle === "min") {
        const nextMin = clamp(rawValue, adapter.min, value.maxValue);
        if (nextMin !== value.minValue) {
          onChange({ minValue: nextMin, maxValue: value.maxValue });
        }
      } else {
        const nextMax = clamp(rawValue, value.minValue, adapter.max);
        if (nextMax !== value.maxValue) {
          onChange({ minValue: value.minValue, maxValue: nextMax });
        }
      }
    },
    [adapter.min, adapter.max, value.minValue, value.maxValue, onChange],
  );

  const percentFromClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  useEffect(() => {
    if (!draggingHandle) return;

    document.body.classList.add("cursor-grabbing");

    const handlePointerMove = (event: PointerEvent) => {
      const rawValue = adapter.percentToValue(
        percentFromClientX(event.clientX),
      );
      setValueForHandle(draggingHandle, rawValue);
    };
    const stopDragging = () => setDraggingHandle(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      document.body.classList.remove("cursor-grabbing");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [draggingHandle, adapter, percentFromClientX, setValueForHandle]);

  const getHandleProps = (handle: HandleKey): HandleRenderProps => {
    const isMin = handle === "min";
    const currentValue = isMin ? value.minValue : value.maxValue;

    return {
      percent: adapter.valueToPercent(currentValue),
      zIndex: activeHandle === handle ? 2 : 1,
      valueNow: currentValue,
      isDragging: draggingHandle === handle,
      ariaProps: {
        "aria-label": isMin ? minLabel : maxLabel,
        "aria-valuemin": isMin ? adapter.min : value.minValue,
        "aria-valuemax": isMin ? value.maxValue : adapter.max,
        "aria-valuetext": formatValue(currentValue),
      },
      onPointerDown: (event) => {
        event.preventDefault();
        setActiveHandle(handle);
        setDraggingHandle(handle);
      },
      onKeyDown: (event) => {
        switch (event.key) {
          case "ArrowRight":
          case "ArrowUp":
            event.preventDefault();
            setActiveHandle(handle);
            setValueForHandle(handle, adapter.step(currentValue, 1));
            break;
          case "ArrowLeft":
          case "ArrowDown":
            event.preventDefault();
            setActiveHandle(handle);
            setValueForHandle(handle, adapter.step(currentValue, -1));
            break;
          case "Home":
            event.preventDefault();
            setActiveHandle(handle);
            setValueForHandle(handle, adapter.min);
            break;
          case "End":
            event.preventDefault();
            setActiveHandle(handle);
            setValueForHandle(handle, adapter.max);
            break;
          default:
            break;
        }
      },
    };
  };

  return {
    trackRef,
    minPercent: adapter.valueToPercent(value.minValue),
    maxPercent: adapter.valueToPercent(value.maxValue),
    getHandleProps,
  };
};
