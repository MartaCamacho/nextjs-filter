import type { FixedRangeValuesResponse, NumberRangeResponse } from "@/types/range";

const MOCK_DELAY_MS = 300;

const delay = async (): Promise<void> => {
  if (process.env.VITEST) return;
  await new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });
};

export const getNumberRange = async (): Promise<NumberRangeResponse> => {
  await delay();
  return { min: 1, max: 100 };
};

export const getFixedRangeValues = async (): Promise<FixedRangeValuesResponse> => {
  await delay();
  return { rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99] };
};
