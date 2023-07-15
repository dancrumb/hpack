import { prefixDecode } from "./prefix-decoder.ts";
import { HUFFMAN_ARRAY } from "./huffman-map.ts";

export function huffmanDecode(code: number[]): {
  plaintext: string;
  remainder: number[];
} {
  const { plaintext: length, remainder: bytes } = prefixDecode(code, 7);
  const [huffmancode, remainder] = [
    bytes.slice(0, Number(length)),
    bytes.slice(Number(length)),
  ];
  let treeIndex = 0;
  let plaintext = "";
  for (const byte of huffmancode) {
    for (const bit of byte.toString(2).padStart(8, "0")) {
      treeIndex = bit === "0" ? treeIndex * 2 + 1 : treeIndex * 2 + 2;
      if (HUFFMAN_ARRAY[treeIndex] !== undefined) {
        plaintext += String.fromCharCode(HUFFMAN_ARRAY[treeIndex] ?? 0);
        treeIndex = 0;
      }
    }
  }
  return { plaintext, remainder };
}
