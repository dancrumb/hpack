import { DynamicTable } from "./dynamic-table.ts";
import { huffmanEncode } from "./huffman-encoder.ts";
import { literalEncode } from "./literal_string_encoder.ts";
import { STATIC_TABLE, STATIC_TABLE_LENGTH } from "./static-table.ts";

export enum ENCODING_TYPE {
  INDEXED_ADD = 0x80,
  LITERAL_WITH_INDEXING = 0x40,
  LITERAL_WITHOUT_INDEXING = 0x00,
  LITERAL_NEVER_INDEXED = 0x10,
}

type EncodingOptions = {
  addToIndex?: boolean;
  huffman?: boolean;
  neverIndex?: boolean;
};

export class EncodingContext {
  readonly staticTable = STATIC_TABLE;
  readonly dynamicTable: DynamicTable;

  constructor(dynamicTableMaxSize = 1024) {
    this.dynamicTable = new DynamicTable(dynamicTableMaxSize);
  }

  setMaxTableSize(size: number) {
    this.dynamicTable.setMaxSize(size);
  }

  get dynamicTableSize(): number {
    return this.dynamicTable.size;
  }

  private getIndex(field: string): number | undefined {
    const staticIndex = this.staticTable.get(field);
    if (staticIndex !== undefined) {
      return staticIndex;
    }
    const dynamicIndex = this.dynamicTable.getIndex(field);

    if (dynamicIndex > 0) {
      return dynamicIndex + STATIC_TABLE_LENGTH;
    }
    return undefined;
  }

  encodeHeader(
    headerName: string,
    value: string,
    {
      addToIndex = true,
      huffman = false,
      neverIndex = false,
    }: EncodingOptions = {
      addToIndex: true,
      huffman: false,
      neverIndex: false,
    }
  ): number[] {
    const result: number[] = [];
    const encode = huffman ? huffmanEncode : literalEncode;

    const index = this.getIndex(`${headerName}: ${value}`);
    if (index !== undefined) {
      result.push(index | ENCODING_TYPE.INDEXED_ADD);
      return result;
    }

    const nameIndex = this.staticTable.get(headerName) ?? 0;
    result.push(
      nameIndex |
        (addToIndex
          ? ENCODING_TYPE.LITERAL_WITH_INDEXING
          : neverIndex
          ? ENCODING_TYPE.LITERAL_NEVER_INDEXED
          : ENCODING_TYPE.LITERAL_WITHOUT_INDEXING)
    );
    if (nameIndex === 0) {
      result.push(...encode(headerName));
    }
    result.push(...encode(value));

    if (addToIndex) {
      this.dynamicTable.addEntry(headerName, value);
    }

    return result;
  }
}
