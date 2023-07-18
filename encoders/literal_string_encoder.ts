import { encodeNumber } from "./prefix_encoder.ts";

export function literalEncode(value: string) {
  const result: number[] = [];
  const nameLength = Array.from(encodeNumber(value.length, 7));
  result.push(...nameLength);
  const nameBytes = Array.from(new TextEncoder().encode(value));
  result.push(...nameBytes);

  return result;
}
