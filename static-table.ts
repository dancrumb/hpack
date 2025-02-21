import headerDictionary from "./header-dictionary.json" with { type: "json" };

const staticEncodingTable: Map<string, number> = new Map();
const staticDecodingTable: Map<number, { name: string; value: string }> =
  new Map();

headerDictionary.forEach(
  (entry: { name: string; value: string | null }, index) => {
    const key = `${entry.name}${
      entry.value === null ? "" : `: ${entry.value}`
    }`;
    staticEncodingTable.set(key, index);
    if (staticEncodingTable.has(entry.name) === false) {
      staticEncodingTable.set(entry.name, index);
    }

    staticDecodingTable.set(index, {
      name: entry.name,
      value: entry.value ?? "",
    });
  },
);

export const STATIC_ENCODING_TABLE: ReadonlyMap<string, number> =
  staticEncodingTable;
export const STATIC_DECODING_TABLE: ReadonlyMap<
  number,
  { name: string; value: string }
> = staticDecodingTable;

export const STATIC_TABLE_LENGTH = headerDictionary.length - 1;
