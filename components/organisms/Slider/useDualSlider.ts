import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { clamp } from "@/lib/utils";
import type { RangeAdapter, SelectedRange } from "@/types/range";

export type HandleKey = "min" | "max";

type UseDualSliderProps = {
  adapter: RangeAdapter;
  value: SelectedRange;
  onChange: (next: SelectedRange) => void;
};

type HandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
};

type UseDualSliderResult = {
  trackRef: RefObject<HTMLDivElement | null>;
  minPercent: number;
  maxPercent: number;
  draggingHandle: HandleKey | null;
  activeHandle: HandleKey;
  getHandleProps: (handle: HandleKey) => HandleProps;
};

export const useDualSlider = ({
  adapter,
  value,
  onChange,
}: UseDualSliderProps): UseDualSliderResult => {
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

  const getHandleProps = (handle: HandleKey): HandleProps => ({
    onPointerDown: (event) => {
      event.preventDefault();
      setActiveHandle(handle);
      setDraggingHandle(handle);
    },
    onKeyDown: (event) => {
      const currentValue = handle === "min" ? value.minValue : value.maxValue;

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
  });

  return {
    trackRef,
    minPercent: adapter.valueToPercent(value.minValue),
    maxPercent: adapter.valueToPercent(value.maxValue),
    draggingHandle,
    activeHandle,
    getHandleProps,
  };
};
