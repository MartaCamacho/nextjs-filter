import { describe, expect, test } from "vitest";
import { clamp, joinClassNames } from "./utils";

describe("clamp", () => {
  test("returns the value when inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test("clamps to min when below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  test("clamps to max when above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  test("returns the bound when value equals min or max", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  test("returns the single valid value when min equals max", () => {
    expect(clamp(7, 5, 5)).toBe(5);
  });
});

describe("joinClassNames", () => {
  test("joins truthy class names with a space", () => {
    expect(joinClassNames("a", "b", "c")).toBe("a b c");
  });

  test("skips false, null, and undefined", () => {
    expect(joinClassNames("a", false, null, undefined, "b")).toBe("a b");
  });

  test("returns an empty string when nothing is truthy", () => {
    expect(joinClassNames(false, undefined, null)).toBe("");
  });
});
