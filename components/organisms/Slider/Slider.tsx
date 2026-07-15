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
  const { trackRef, minPercent, maxPercent, getHandleProps } = useDualSlider({
    adapter,
    value,
    onChange,
    formatValue,
  });

  return (
    <div ref={trackRef} className="relative flex h-11 w-full items-center">
      <SliderTrack minPercent={minPercent} maxPercent={maxPercent} />
      <SliderHandle label={minLabel} {...getHandleProps("min")} />
      <SliderHandle label={maxLabel} {...getHandleProps("max")} />
    </div>
  );
};

export default Slider;
