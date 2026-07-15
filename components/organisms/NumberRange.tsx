"use client";

import { useMemo, useState } from "react";
import EditableRangeLabel from "@/components/molecules/EditableRangeLabel";
import Slider from "@/components/organisms/Slider";
import { formatCurrency } from "@/lib/format";
import { createContinuousAdapter } from "@/lib/slider/adapters";
import { createRangeStore } from "@/lib/store";
import type { NumberRangeResponse } from "@/types/range";

const NumberRange = ({ min, max }: NumberRangeResponse) => {
  const adapter = useMemo(
    () => createContinuousAdapter(min, max),
    [min, max],
  );
  const [useRangeStore] = useState(() =>
    createRangeStore(adapter, { minValue: min, maxValue: max }),
  );

  const minValue = useRangeStore((state) => state.minValue);
  const maxValue = useRangeStore((state) => state.maxValue);
  const setMinValue = useRangeStore((state) => state.setMinValue);
  const setMaxValue = useRangeStore((state) => state.setMaxValue);

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
        <EditableRangeLabel
          caption="From"
          value={minValue}
          onCommit={setMinValue}
        />
        <EditableRangeLabel
          caption="To"
          value={maxValue}
          onCommit={setMaxValue}
        />
      </div>
    </div>
  );
};

export default NumberRange;
