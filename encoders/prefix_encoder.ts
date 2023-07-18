import { Encoder } from "../types.ts";

export const encodeNumber: Encoder<number> = (
  value: number,
  prefix: number,
): number[] => {
  if (value < (1 << prefix) - 1) {
    return [value];
  }
  const result: number[] = [(1 << prefix) - 1];
  value = value - ((1 << prefix) - 1);
  while (value > 128) {
    result.push((value % 128) + 128);
    value = Math.floor(value / 128);
  }
  result.push(value);
  return result;
};
