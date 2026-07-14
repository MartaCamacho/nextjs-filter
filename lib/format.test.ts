import { describe, expect, test } from "vitest";
import { formatCurrency } from "./format";

const reference = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

describe("formatCurrency", () => {
  test("formats whole numbers with two decimals, matching es-ES EUR", () => {
    expect(formatCurrency(1)).toBe(reference.format(1));
    expect(formatCurrency(100)).toBe(reference.format(100));
  });

  test("formats decimals with a comma separator", () => {
    expect(formatCurrency(5.99)).toBe(reference.format(5.99));
    expect(formatCurrency(70.99)).toBe(reference.format(70.99));
  });

  test("rounds to two decimal places", () => {
    expect(formatCurrency(5.999)).toBe(reference.format(6));
  });

  test("always shows two decimals, never a bare integer", () => {
    expect(formatCurrency(660)).toContain(",00");
  });
});
