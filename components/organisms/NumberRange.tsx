"use client";

import { useMemo, useState } from "react";
import EditableRangeLabel from "@/components/molecules/EditableRangeLabel";
import Range from "@/components/organisms/Range";
import { formatCurrency } from "@/lib/format";
import { createContinuousAdapter } from "@/lib/adapters";
import { clamp } from "@/lib/utils";
import type { NumberRangeResponse, SelectedRange } from "@/types/range";

const NumberRange = ({ min, max }: NumberRangeResponse) => {
  const adapter = useMemo(
    () => createContinuousAdapter(min, max),
    [min, max],
  );
  const [range, setRange] = useState<SelectedRange>(() => ({
    minValue: min,
    maxValue: max,
  }));

  const commitMinValue = (value: number) => {
    setRange((current) => ({
      ...current,
      minValue: clamp(value, adapter.min, current.maxValue),
    }));
  };

  const commitMaxValue = (value: number) => {
    setRange((current) => ({
      ...current,
      maxValue: clamp(value, current.minValue, adapter.max),
    }));
  };

  return (
    <div className="w-full">
      <Range
        adapter={adapter}
        value={range}
        onChange={setRange}
        minLabel="Minimum price"
        maxLabel="Maximum price"
        formatValue={formatCurrency}
      />
      <div className="mt-6 flex items-center justify-between">
        <EditableRangeLabel
          caption="From"
          value={range.minValue}
          onCommit={commitMinValue}
        />
        <EditableRangeLabel
          caption="To"
          value={range.maxValue}
          onCommit={commitMaxValue}
        />
      </div>
    </div>
  );
};

export default NumberRange;
