import { DynamicTable } from "./dynamic-table.ts";
import { huffmanEncode } from "./encoders/huffman_encoder.ts";
import { literalEncode } from "./encoders/literal_string_encoder.ts";
import { STATIC_ENCODING_TABLE, STATIC_TABLE_LENGTH } from "./static-table.ts";
import { Encoder } from "./types.ts";

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

/**
 * This is the encoding context for HPACK. When used for HTTP/2, you should create a new context for each connection
 */
export class EncodingContext {
  readonly staticTable = STATIC_ENCODING_TABLE;
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

  /**
   * Given the name and value of a header field, returns an array of bytes representing the encoded header
   */
  encodeHeader(
    headerName: string,
    value: string,
    options: EncodingOptions = {}
  ): number[] {
    const { addToIndex = true, huffman = false, neverIndex = false } = options;
    const result: number[] = [];
    const encode: Encoder<string> = huffman ? huffmanEncode : literalEncode;

    const index = this.getIndex(`${headerName}: ${value}`);
    if (index !== undefined) {
      result.push(index | ENCODING_TYPE.INDEXED_ADD);
      return result;
    }

    let indexingFlag: ENCODING_TYPE;
    if (addToIndex) {
      if (neverIndex) {
        indexingFlag = ENCODING_TYPE.LITERAL_NEVER_INDEXED;
      } else {
        indexingFlag = ENCODING_TYPE.LITERAL_WITH_INDEXING;
      }
    } else {
      indexingFlag = ENCODING_TYPE.LITERAL_WITHOUT_INDEXING;
    }

    const nameIndex = this.staticTable.get(headerName) ?? 0;
    result.push(nameIndex | indexingFlag);
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
