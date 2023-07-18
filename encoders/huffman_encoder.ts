import { HUFFMAN_MAP } from "../huffman-map.ts";
import { encodeNumber } from "./prefix_encoder.ts";

export function huffmanEncode(value: string): number[] {
  const result: number[] = [];

  let encoding = 0n;
  let totalLength = 0;
  for (const char of value) {
    const huffmanCode = HUFFMAN_MAP.get(char.charCodeAt(0));
    if (huffmanCode === undefined) {
      throw new Error(`No encoding for ${char}`);
    }
    const codeValue = parseInt(huffmanCode ?? "", 2);

    encoding = (encoding << BigInt(huffmanCode?.length ?? 0)) |
      BigInt(codeValue);
    totalLength += huffmanCode?.length ?? 0;
  }
  const overrun = totalLength % 8;
  if (overrun !== 0) {
    const requiredPadding = 8 - overrun;
    encoding = (encoding << BigInt(requiredPadding)) |
      (2n ** BigInt(requiredPadding) - 1n);
    totalLength += requiredPadding;
  }
  const bytes = encoding
    .toString(16)
    .match(/.{2}/g)
    ?.map((byte) => parseInt(byte, 16)) ?? [];

  const nameLength = Array.from(encodeNumber(totalLength / 8, 7));
  nameLength[0] |= 0x80;
  result.push(...nameLength);
  result.push(...bytes);

  return result;
}
