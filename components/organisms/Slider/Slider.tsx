import SliderHandle from "@/components/atoms/SliderHandle";
import SliderTrack from "@/components/atoms/SliderTrack";
import type { RangeAdapter, SelectedRange } from "@/types/range";
import { useDualSlider } from "./useDualSlider";

type SliderProps = {
  adapter: RangeAdapter;
  value: SelectedRange;
  onChange: (next: SelectedRange) => void;
  minLabel: string;
  maxLabel: string;
  formatValue: (value: number) => string;
};

const Slider = ({
  adapter,
  value,
  onChange,
  minLabel,
  maxLabel,
  formatValue,
}: SliderProps) => {
  const {
    trackRef,
    minPercent,
    maxPercent,
    draggingHandle,
    activeHandle,
    getHandleProps,
  } = useDualSlider({ adapter, value, onChange });

  return (
    <div ref={trackRef} className="relative flex h-11 w-full items-center">
      <SliderTrack minPercent={minPercent} maxPercent={maxPercent} />
      <SliderHandle
        percent={minPercent}
        zIndex={activeHandle === "min" ? 2 : 1}
        label={minLabel}
        valueNow={value.minValue}
        valueMin={adapter.min}
        valueMax={value.maxValue}
        valueText={formatValue(value.minValue)}
        isDragging={draggingHandle === "min"}
        {...getHandleProps("min")}
      />
      <SliderHandle
        percent={maxPercent}
        zIndex={activeHandle === "max" ? 2 : 1}
        label={maxLabel}
        valueNow={value.maxValue}
        valueMin={value.minValue}
        valueMax={adapter.max}
        valueText={formatValue(value.maxValue)}
        isDragging={draggingHandle === "max"}
        {...getHandleProps("max")}
      />
    </div>
  );
};

export default Slider;
