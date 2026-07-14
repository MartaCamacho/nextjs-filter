/** Maps between raw values and track positions for a range domain (continuous or discrete). */
export interface RangeAdapter {
  /** Lowest valid value in the domain. */
  min: number;
  /** Highest valid value in the domain. */
  max: number;
  /** Converts a domain value to a 0-100 track position. */
  valueToPercent(value: number): number;
  /** Converts a 0-100 track position to the nearest valid domain value. */
  percentToValue(percent: number): number;
  /** Returns the next/previous valid value from `value`, clamped to the domain. */
  step(value: number, direction: 1 | -1): number;
}

/** The pair of values currently selected on a range slider. */
export interface SelectedRange {
  minValue: number;
  maxValue: number;
}

/** Response shape of the mocked "normal range" service (`{min, max}`). */
export interface NumberRangeResponse {
  min: number;
  max: number;
}

/** Response shape of the mocked "fixed values range" service (`{rangeValues}`). */
export interface FixedRangeValuesResponse {
  rangeValues: number[];
}
