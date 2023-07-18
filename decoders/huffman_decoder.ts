import { HUFFMAN_ARRAY } from "../huffman-map.ts";
import { Decoder } from "../types.ts";
import { prefixDecode } from "./prefix_decoder.ts";

export const huffmanDecode: Decoder = (code: number[]) => {
  const { plaintext: length, remainder: bytes } = prefixDecode(code, 7);
  const [huffmancode, remainder] = [
    bytes.slice(0, Number(length)),
    bytes.slice(Number(length)),
  ];
  let treeIndex = 0;
  let plaintext = "";
  for (const byte of huffmancode) {
    for (const bit of byte.toString(2).padStart(8, "0")) {
      treeIndex = treeIndex * 2 + (bit === "0" ? 1 : 2);
      const charCode = HUFFMAN_ARRAY[treeIndex];
      if (charCode !== undefined) {
        plaintext += String.fromCharCode(charCode);
        treeIndex = 0;
      }
    }
  }
  return { plaintext, remainder };
};
