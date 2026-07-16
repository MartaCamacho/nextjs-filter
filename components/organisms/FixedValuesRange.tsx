"use client";

import { useMemo, useState } from "react";
import RangeLabel from "@/components/atoms/RangeLabel";
import Range from "@/components/organisms/Range";
import { formatCurrency } from "@/lib/format";
import { createDiscreteAdapter } from "@/lib/adapters";
import type { FixedRangeValuesResponse, SelectedRange } from "@/types/range";

const FixedValuesRange = ({ rangeValues }: FixedRangeValuesResponse) => {
  const adapter = useMemo(
    () => createDiscreteAdapter(rangeValues),
    [rangeValues],
  );
  const [range, setRange] = useState<SelectedRange>(() => ({
    minValue: adapter.min,
    maxValue: adapter.max,
  }));

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
        <RangeLabel caption="From" value={range.minValue} />
        <RangeLabel caption="To" value={range.maxValue} />
      </div>
    </div>
  );
};

export default FixedValuesRange;
