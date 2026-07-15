import { describe, expect, test } from "vitest";
import { createContinuousAdapter, createDiscreteAdapter } from "./adapters";

describe("createContinuousAdapter", () => {
  const adapter = createContinuousAdapter(1, 100);

  test("maps domain bounds to 0 and 100 percent", () => {
    expect(adapter.valueToPercent(1)).toBe(0);
    expect(adapter.valueToPercent(100)).toBe(100);
  });

  test("maps 0 and 100 percent back to the domain bounds", () => {
    expect(adapter.percentToValue(0)).toBe(1);
    expect(adapter.percentToValue(100)).toBe(100);
  });

  test("clamps values outside the domain when converting to percent", () => {
    expect(adapter.valueToPercent(-50)).toBe(0);
    expect(adapter.valueToPercent(500)).toBe(100);
  });

  test("clamps percentages outside 0-100 when converting to a value", () => {
    expect(adapter.percentToValue(-20)).toBe(1);
    expect(adapter.percentToValue(150)).toBe(100);
  });

  test("step moves by the configured step size, clamped to the domain", () => {
    expect(adapter.step(50, 1)).toBe(51);
    expect(adapter.step(50, -1)).toBe(49);
    expect(adapter.step(1, -1)).toBe(1);
    expect(adapter.step(100, 1)).toBe(100);
  });

  test("does not divide by zero when min equals max", () => {
    const single = createContinuousAdapter(5, 5);
    expect(single.valueToPercent(5)).toBe(0);
    expect(single.percentToValue(50)).toBe(5);
  });
});

describe("createDiscreteAdapter", () => {
  const values = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];
  const adapter = createDiscreteAdapter(values);

  test("exposes the sorted first and last values as min/max", () => {
    expect(adapter.min).toBe(1.99);
    expect(adapter.max).toBe(70.99);
  });

  test("spaces values evenly by index, not proportionally by magnitude", () => {
    expect(adapter.valueToPercent(1.99)).toBe(0);
    expect(adapter.valueToPercent(10.99)).toBe(40);
    expect(adapter.valueToPercent(30.99)).toBe(60);
    expect(adapter.valueToPercent(70.99)).toBe(100);
  });

  test("snaps an arbitrary value to the nearest allowed value's position", () => {
    expect(adapter.valueToPercent(31)).toBe(60);
  });

  test("converts a percent back to the nearest allowed value", () => {
    expect(adapter.percentToValue(0)).toBe(1.99);
    expect(adapter.percentToValue(60)).toBe(30.99);
    expect(adapter.percentToValue(100)).toBe(70.99);
  });

  test("step moves to the adjacent allowed value, clamped at the ends", () => {
    expect(adapter.step(30.99, 1)).toBe(50.99);
    expect(adapter.step(30.99, -1)).toBe(10.99);
    expect(adapter.step(1.99, -1)).toBe(1.99);
    expect(adapter.step(70.99, 1)).toBe(70.99);
  });

  test("sorts unsorted input before deriving min/max", () => {
    const unsorted = createDiscreteAdapter([70.99, 1.99, 30.99]);
    expect(unsorted.min).toBe(1.99);
    expect(unsorted.max).toBe(70.99);
  });

  test("does not divide by zero with a single-value domain", () => {
    const single = createDiscreteAdapter([5]);
    expect(single.valueToPercent(5)).toBe(0);
    expect(single.percentToValue(50)).toBe(5);
    expect(single.step(5, 1)).toBe(5);
  });

  test("throws for an empty values array", () => {
    expect(() => createDiscreteAdapter([])).toThrow();
  });
});
