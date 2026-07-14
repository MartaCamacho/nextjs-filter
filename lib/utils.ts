export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
