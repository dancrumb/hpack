import huffmanMapJson from "./huffman-map.json" assert { type: "json" };

export const HUFFMAN_MAP: ReadonlyMap<number, string> = new Map(
  huffmanMapJson as [number, string][],
);

const huffmanArray: (number | undefined)[] = [];
for (const [key, value] of HUFFMAN_MAP.entries()) {
  let treeIndex = 0;
  for (const bit of value) {
    treeIndex = bit === "0" ? treeIndex * 2 + 1 : treeIndex * 2 + 2;
  }
  huffmanArray[treeIndex] = key;
}

export const HUFFMAN_ARRAY: ReadonlyArray<number | undefined> = huffmanArray;
