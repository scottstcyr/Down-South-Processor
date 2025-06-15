import { ToNumberOrUndefined } from './stringUtils';

export function roundTo(value: number | string | undefined, places: number): number | undefined {
  if (typeof value === 'string') {
    value = ToNumberOrUndefined(value);
  }
  if (value === undefined) return undefined;
  const multiplier = Math.pow(10, places);
  return Math.round(value * multiplier) / multiplier;
}

export function toInt(value: number | string | undefined): number | undefined {
  if (typeof value === 'string') {
    value = ToNumberOrUndefined(value);
  }
  if (value === undefined) return undefined;
  return Math.round(value);
}
