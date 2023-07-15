import { DynamicTable } from "./dynamic-table.ts";
import { huffmanDecode } from "./huffman-decoder.ts";
import { literalDecode } from "./literal_string_decoder.ts";
import { prefixDecode } from "./prefix-decoder.ts";
import { STATIC_DECODING_TABLE, STATIC_TABLE_LENGTH } from "./static-table.ts";
import { DecodeResult, Header, PlainText } from "./types.ts";

export enum DECODING_TYPE {
  INDEXED_ADD = 0x80,
  LITERAL_WITH_INDEXING = 0x40,
  LITERAL_WITHOUT_INDEXING = 0x00,
  LITERAL_NEVER_INDEXED = 0x10,
}

type HeaderDecodingResult = DecodeResult<Header>;

function stringDecode(code: number[]): DecodeResult<PlainText<string>> {
  const useHuffman = (code[0] & 0x80) === 0x80;
  return useHuffman ? huffmanDecode(code) : literalDecode(code);
}

export class DecodingContext {
  readonly staticTable = STATIC_DECODING_TABLE;
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

  private getField(index: number): Header | undefined {
    const staticField = this.staticTable.get(index);
    if (staticField !== undefined) {
      return staticField;
    }
    return this.dynamicTable.getField(index - STATIC_TABLE_LENGTH);
  }

  private handleIndexedHeader(code: number[]): HeaderDecodingResult {
    // Indexed Header Field Representation
    const { plaintext, remainder } = prefixDecode(code, 7);

    const field = this.getField(Number(plaintext));
    if (field === undefined) {
      throw new Error(`Invalid header index detected`, {
        cause: { plaintext },
      });
    }

    return { ...field, remainder };
  }

  private handleTableResize(code: number[]): HeaderDecodingResult {
    const { plaintext, remainder } = prefixDecode(code, 5);
    this.dynamicTable.setMaxSize(Number(plaintext));
    return { name: "", value: "", remainder };
  }

  private decodeHeaderName(
    code: number[],
    indexPrefixLength: number,
  ): DecodeResult<PlainText<string>> {
    const decodedIndex = prefixDecode(code, indexPrefixLength);
    let headerName = "";
    let remainingCode = decodedIndex.remainder;
    const index = Number(decodedIndex.plaintext);
    if (index === 0) {
      // Literal header name
      const decodedHeaderName = stringDecode(remainingCode);
      headerName = decodedHeaderName.plaintext;
      remainingCode = decodedHeaderName.remainder;
    } else {
      // Indexed header name
      const indexedName = this.getField(index);
      if (indexedName === undefined) {
        throw new Error(`Invalid header index detected`, {
          cause: { index },
        });
      }
      headerName = indexedName.name;
    }
    return { plaintext: headerName, remainder: remainingCode };
  }

  private handleLiteralWithIndexing(
    code: number[],
    indexPrefixLength: number,
  ): HeaderDecodingResult {
    if (code.length === 0) {
      return { name: "", value: "", remainder: [] };
    }
    // Literal Header Field with Incremental Indexing
    const headerDecodeResult = this.decodeHeaderName(code, indexPrefixLength);
    const headerName = headerDecodeResult.plaintext;
    let remainingCode = headerDecodeResult.remainder;

    const decodedHeaderValue = stringDecode(remainingCode);

    const value = decodedHeaderValue.plaintext;
    remainingCode = decodedHeaderValue.remainder;

    this.dynamicTable.addEntry(headerName, value);

    return { name: headerName, value, remainder: remainingCode };
  }

  decodeHeader(code: number[]): HeaderDecodingResult {
    const firstByte = code[0];
    const isIndexedHeader = (firstByte & 0x80) === 0x80;
    const isLiteralWithIndexing = (firstByte & 0x40) === 0x40;
    const isDynamicTableSizeUpdate = (firstByte & 0xe0) === 0x20;
    const isLiteralNeverIndexed = (firstByte & 0x10) === 0x10;
    const isLiteralWithoutIndexing = (firstByte & 0xf0) === 0x00;

    if (isDynamicTableSizeUpdate) {
      return this.handleTableResize(code);
    }

    if (isIndexedHeader) {
      return this.handleIndexedHeader(code);
    }

    if (isLiteralWithIndexing) {
      return this.handleLiteralWithIndexing(code, 6);
    }
    if (isLiteralWithoutIndexing || isLiteralNeverIndexed) {
      return this.handleLiteralWithIndexing(code, 4);
    }

    throw new Error(`Invalid header encoding detected`, {
      cause: { firstByte },
    });
  }
}
