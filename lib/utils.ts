export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(" ");
