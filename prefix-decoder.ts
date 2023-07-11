export function decodeNumber(
  code: number[],
  prefix: number,
): { plaintext: bigint; remainder: number[] } {
  if (code[0] < 1 << (prefix - 1)) {
    return { plaintext: BigInt(code[0]), remainder: code.slice(1) };
  }
  let m = 0n;
  let i = BigInt(code.shift() ?? 0) & (2n ** BigInt(prefix) - 1n);
  let octet = 0n;
  do {
    octet = BigInt(code.shift() ?? 0);
    i = i + (octet & 127n) * 2n ** m;
    m = m + 7n;
  } while ((octet & 128n) === 128n);
  return { plaintext: i, remainder: code };
}
