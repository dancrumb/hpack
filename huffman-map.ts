import huffmanMapJson from "./huffman-map.json" assert { type: "json" };

export const HUFFMAN_MAP: ReadonlyMap<number, string> = new Map(
  huffmanMapJson as [number, string][],
);
