import { HUFFMAN_MAP } from "./huffman-map.ts";
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
  readonly dynamicTable: string[] = [];

  constructor(private dynamicTableMaxSize = 1024) {}

  setMaxTableSize(size: number) {
    this.dynamicTableMaxSize = size;
  }

  get dynamicTableSize(): number {
    return this.dynamicTable.reduce((sum, entry) => {
      return sum + (entry.length - 2) + 32; // -2 is for the colon and space;
    }, 0);
  }

  private addTableEntry(name: string, value: string) {
    this.dynamicTable.unshift(`${name}: ${value}`);
    while (this.dynamicTableSize > this.dynamicTableMaxSize) {
      this.dynamicTable.pop();
    }
  }

  private getDynamicIndex(field: string): number | undefined {
    const index = this.dynamicTable.indexOf(field);
    return index >= 0 ? (index + 1 + STATIC_TABLE_LENGTH) : undefined;
  }

  encodeNumber(value: number, prefix: number): number[] {
    if (value < (1 << prefix) - 1) {
      return [value];
    }
    const result: number[] = [(1 << prefix) - 1];
    value = value - ((1 << prefix) - 1);
    while (value > 128) {
      result.push((value % 128) + 128);
      value = Math.floor(value / 128);
    }
    result.push(value);
    return result;
  }

  private literalEncode(value: string) {
    const result: number[] = [];
    const nameLength = Array.from(this.encodeNumber(value.length, 7));
    result.push(...nameLength);
    const nameBytes = Array.from(new TextEncoder().encode(value));
    result.push(...nameBytes);

    return result;
  }

  private huffmanEncode(value: string) {
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
      encoding = encoding << BigInt(requiredPadding) |
        (2n ** BigInt(requiredPadding) - 1n);
      totalLength += requiredPadding;
    }
    const bytes =
      encoding.toString(16).match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) ??
        [];

    const nameLength = Array.from(this.encodeNumber(totalLength / 8, 7));
    nameLength[0] |= 0x80;
    result.push(...nameLength);
    result.push(...bytes);

    return result;
  }

  encodeHeader(
    headerName: string,
    value: string,
    { addToIndex = true, huffman = false, neverIndex = false }:
      EncodingOptions = {
        addToIndex: true,
        huffman: false,
        neverIndex: false,
      },
  ): number[] {
    const result: number[] = [];
    const encode = huffman
      ? this.huffmanEncode.bind(this)
      : this.literalEncode.bind(this);

    const index = this.staticTable.get(`${headerName}: ${value}`) ??
      this.getDynamicIndex(`${headerName}: ${value}`);
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
          : ENCODING_TYPE.LITERAL_WITHOUT_INDEXING),
    );
    if (nameIndex === 0) {
      result.push(...encode(headerName));
    }
    result.push(...encode(value));

    if (addToIndex) {
      this.addTableEntry(headerName, value);
    }

    return result;
  }
}
