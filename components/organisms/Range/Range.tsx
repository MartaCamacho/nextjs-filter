import RangeHandle from "@/components/atoms/RangeHandle";
import RangeTrack from "@/components/atoms/RangeTrack";
import type { RangeAdapter, SelectedRange } from "@/types/range";
import { useRange } from "./useRange";

type RangeProps = {
  adapter: RangeAdapter;
  value: SelectedRange;
  onChange: (next: SelectedRange) => void;
  minLabel: string;
  maxLabel: string;
  formatValue: (value: number) => string;
};

const Range = ({
  adapter,
  value,
  onChange,
  minLabel,
  maxLabel,
  formatValue,
}: RangeProps) => {
  const { trackRef, minPercent, maxPercent, getHandleProps } = useRange({
    adapter,
    value,
    onChange,
    minLabel,
    maxLabel,
    formatValue,
  });

  return (
    <div ref={trackRef} className="relative flex h-11 w-full items-center">
      <RangeTrack minPercent={minPercent} maxPercent={maxPercent} />
      <RangeHandle {...getHandleProps("min")} />
      <RangeHandle {...getHandleProps("max")} />
    </div>
  );
};

export default Range;
