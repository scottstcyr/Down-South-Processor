export function getEnumKeyByValue<T extends { [key: string]: string }>(enumObj: T, value: string): keyof T | undefined {
  const entries = Object.entries(enumObj) as [keyof T, string][];
  const foundEntry = entries.find(([, enumValue]) => enumValue === value);
  return foundEntry ? foundEntry[0] : undefined;
}

export function extractDistinctValues<T>(items: (T | undefined)[]): Set<T> {
  const distinctValues = new Set<T>();
  items.forEach(item => (item !== undefined) ? distinctValues.add(item) : {} );
  return distinctValues;
}
