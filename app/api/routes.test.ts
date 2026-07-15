import { describe, expect, test } from "vitest";
import { GET as getRange } from "./range/route";
import { GET as getRangeValues } from "./range-values/route";

describe("mocked API routes", () => {
  test("GET /api/range returns the mocked number range", async () => {
    const response = await getRange();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ min: 1, max: 100 });
  });

  test("GET /api/range-values returns the mocked fixed range values", async () => {
    const response = await getRangeValues();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
    });
  });
});
