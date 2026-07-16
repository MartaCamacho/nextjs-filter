"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import RangeLabel from "@/components/atoms/RangeLabel";
import Slider from "@/components/organisms/Slider";
import { formatCurrency } from "@/lib/format";
import { createDiscreteAdapter } from "@/lib/slider/adapters";
import { createRangeStore } from "@/lib/store";
import type { FixedRangeValuesResponse } from "@/types/range";

const FixedValuesRange = ({ rangeValues }: FixedRangeValuesResponse) => {
  const adapter = useMemo(
    () => createDiscreteAdapter(rangeValues),
    [rangeValues],
  );
  const [useRangeStore] = useState(() =>
    createRangeStore(adapter, {
      minValue: adapter.min,
      maxValue: adapter.max,
    }),
  );

  const { minValue, maxValue, setMinValue, setMaxValue } = useRangeStore(
    useShallow((state) => ({
      minValue: state.minValue,
      maxValue: state.maxValue,
      setMinValue: state.setMinValue,
      setMaxValue: state.setMaxValue,
    })),
  );

  return (
    <div className="w-full">
      <Slider
        adapter={adapter}
        value={{ minValue, maxValue }}
        onChange={(next) => {
          setMinValue(next.minValue);
          setMaxValue(next.maxValue);
        }}
        minLabel="Minimum price"
        maxLabel="Maximum price"
        formatValue={formatCurrency}
      />
      <div className="mt-6 flex items-center justify-between">
        <RangeLabel caption="From" value={minValue} />
        <RangeLabel caption="To" value={maxValue} />
      </div>
    </div>
  );
};

export default FixedValuesRange;
