import { hexDumpToArray } from "../hexdump-to-array.ts";
import { HUFFMAN_MAP } from "../huffman-map.ts";
import { Encoder } from "../types.ts";
import { encodeNumber } from "./prefix_encoder.ts";

export const huffmanEncode: Encoder = (value: string): number[] => {
  const result: number[] = [];

  let encoding = 0n;
  let totalLength = 0;
  for (const char of value) {
    const huffmanCode = HUFFMAN_MAP.get(char.charCodeAt(0));
    if (huffmanCode === undefined) {
      throw new Error(`No encoding for ${char}`);
    }
    const codeValue = parseInt(huffmanCode, 2);

    encoding = (encoding << BigInt(huffmanCode.length)) | BigInt(codeValue);
    totalLength += huffmanCode.length;
  }
  const overrun = totalLength % 8;
  if (overrun !== 0) {
    const requiredPadding = BigInt(8 - overrun);
    encoding = (encoding << requiredPadding) | (2n ** requiredPadding - 1n);
    totalLength += Number(requiredPadding);
  }
  const bytes = hexDumpToArray(encoding.toString(16));

  const nameLength = encodeNumber(totalLength / 8, 7);
  nameLength[0] |= 0x80;
  result.push(...nameLength, ...bytes);

  return result;
};
