import { clamp } from "@/lib/utils";
import type { RangeAdapter } from "@/types/range";

export const createContinuousAdapter = (
  min: number,
  max: number,
  step = 1,
): RangeAdapter => {
  const span = max - min;

  const valueToPercent = (value: number): number =>
    span === 0 ? 0 : clamp(((value - min) / span) * 100, 0, 100);

  const percentToValue = (percent: number): number => {
    const rawValue = min + (clamp(percent, 0, 100) / 100) * span;
    return clamp(Math.round(rawValue / step) * step, min, max);
  };

  const stepValue = (value: number, direction: 1 | -1): number =>
    clamp(value + direction * step, min, max);

  return { min, max, valueToPercent, percentToValue, step: stepValue };
};

export const createDiscreteAdapter = (values: number[]): RangeAdapter => {
  const sorted = [...values].sort((a, b) => a - b);
  const firstValue = sorted[0];
  const lastValue = sorted[sorted.length - 1];

  if (firstValue === undefined || lastValue === undefined) {
    throw new Error("createDiscreteAdapter requires at least one value");
  }

  const lastIndex = sorted.length - 1;

  const closestIndex = (value: number): number =>
    sorted.reduce<{ index: number; diff: number }>(
      (best, candidate, index) => {
        const diff = Math.abs(candidate - value);
        return diff < best.diff ? { index, diff } : best;
      },
      { index: 0, diff: Infinity },
    ).index;

  const valueToPercent = (value: number): number =>
    lastIndex === 0 ? 0 : (closestIndex(value) / lastIndex) * 100;

  const percentToValue = (percent: number): number => {
    const index =
      lastIndex === 0
        ? 0
        : Math.round((clamp(percent, 0, 100) / 100) * lastIndex);
    return sorted[clamp(index, 0, lastIndex)] ?? firstValue;
  };

  const stepValue = (value: number, direction: 1 | -1): number => {
    const nextIndex = clamp(closestIndex(value) + direction, 0, lastIndex);
    return sorted[nextIndex] ?? firstValue;
  };

  return {
    min: firstValue,
    max: lastValue,
    valueToPercent,
    percentToValue,
    step: stepValue,
  };
};
