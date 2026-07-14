export interface RangeAdapter {
  min: number;
  max: number;
  valueToPercent(value: number): number;
  percentToValue(percent: number): number;
  step(value: number, direction: 1 | -1): number;
}

export interface SelectedRange {
  minValue: number;
  maxValue: number;
}

export interface NumberRangeResponse {
  min: number;
  max: number;
}

export interface FixedRangeValuesResponse {
  rangeValues: number[];
}
