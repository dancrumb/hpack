import { Decoder } from "../types.ts";

export const prefixDecode: Decoder<bigint> = (
  code: ReadonlyArray<number>,
  prefix: number,
) => {
  const remainder = [...code];
  let i = BigInt(remainder.shift() ?? 0) & (2n ** BigInt(prefix) - 1n);
  if (i < 2 ** prefix - 1) {
    return { plaintext: i, remainder };
  }
  let m = 0n;
  let octet = 0n;
  do {
    octet = BigInt(remainder.shift() ?? 0);
    i = i + (octet & 127n) * 2n ** m;
    m = m + 7n;
  } while ((octet & 128n) === 128n);
  return { plaintext: i, remainder };
};
