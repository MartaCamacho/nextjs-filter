import { create } from "zustand";
import { clamp } from "@/lib/utils";
import type { RangeAdapter, SelectedRange } from "@/types/range";

type RangeStore = SelectedRange & {
  setMinValue: (value: number) => void;
  setMaxValue: (value: number) => void;
};

export const createRangeStore = (
  adapter: RangeAdapter,
  initial: SelectedRange,
) =>
  create<RangeStore>((set, get) => ({
    ...initial,
    setMinValue: (value) => {
      set({ minValue: clamp(value, adapter.min, get().maxValue) });
    },
    setMaxValue: (value) => {
      set({ maxValue: clamp(value, get().minValue, adapter.max) });
    },
  }));
