import headerDictionary from "./header-dictionary.json" assert { type: "json" };

const staticTable: Map<string, number> = new Map<string, number>();
headerDictionary.forEach(
  (entry: { name: string; value: string | null }, index) => {
    const key = `${entry.name}${
      entry.value === null ? "" : `: ${entry.value}`
    }`;
    staticTable.set(key, index);
    if (staticTable.has(entry.name) === false) {
      staticTable.set(entry.name, index);
    }
  },
);

export const STATIC_TABLE: ReadonlyMap<string, number> = staticTable;

export const STATIC_TABLE_LENGTH = headerDictionary.length - 1;
