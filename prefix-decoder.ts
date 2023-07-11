export function decodeNumber(
  code: number[],
  prefix: number,
): { plaintext: bigint; remainder: number[] } {
  let i = BigInt(code.shift() ?? 0) & (2n ** BigInt(prefix) - 1n);
  if (i < 1 << (prefix - 1)) {
    return { plaintext: BigInt(i), remainder: code };
  }
  let m = 0n;
  let octet = 0n;
  do {
    octet = BigInt(code.shift() ?? 0);
    i = i + (octet & 127n) * 2n ** m;
    m = m + 7n;
  } while ((octet & 128n) === 128n);
  return { plaintext: i, remainder: code };
}
