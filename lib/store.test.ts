import { describe, expect, test } from "vitest";
import { createContinuousAdapter } from "@/lib/slider/adapters";
import { createRangeStore } from "./store";

describe("createRangeStore", () => {
  test("initializes with the given values", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    expect(useStore.getState()).toMatchObject({ minValue: 20, maxValue: 80 });
  });

  test("setMinValue accepts a value within bounds", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    useStore.getState().setMinValue(30);

    expect(useStore.getState().minValue).toBe(30);
  });

  test("setMinValue clamps below the domain minimum", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    useStore.getState().setMinValue(-50);

    expect(useStore.getState().minValue).toBe(1);
  });

  test("setMinValue clamps at the current max value, not the domain max", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    useStore.getState().setMinValue(95);

    expect(useStore.getState().minValue).toBe(80);
  });

  test("setMaxValue clamps above the domain maximum", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    useStore.getState().setMaxValue(500);

    expect(useStore.getState().maxValue).toBe(100);
  });

  test("setMaxValue clamps at the current min value, not the domain min", () => {
    const adapter = createContinuousAdapter(1, 100);
    const useStore = createRangeStore(adapter, { minValue: 20, maxValue: 80 });

    useStore.getState().setMaxValue(5);

    expect(useStore.getState().maxValue).toBe(20);
  });
});
