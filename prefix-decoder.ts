export function decodeNumber(code: number[], prefix: number): bigint {
  if (code.length === 1 && code[0] < 1 << (prefix - 1)) {
    return BigInt(code[0]);
  }
  let m = 0n;
  let i = BigInt(code.shift() ?? 0) & (2n ** BigInt(prefix) - 1n);
  let octet = 0n;
  do {
    octet = BigInt(code.shift() ?? 0);
    i = i + (octet & 127n) * 2n ** m;
    m = m + 7n;
  } while ((octet & 128n) === 128n);
  return i;
}
