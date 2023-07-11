import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { huffmanDecode } from "./huffman-decoder.ts";

describe("huffmanDecode", () => {
  it("decodes an empty string", () => {
    assertEquals(huffmanDecode([0x80]), { plaintext: "", remainder: [] });
  });
  it("decodes a string", () => {
    assertEquals(
      huffmanDecode([0x88, 0x25, 0xa8, 0x49, 0xe9, 0x5b, 0xa9, 0x7d, 0x7f]),
      { plaintext: "custom-key", remainder: [] },
    );
    assertEquals(
      huffmanDecode([
        0x89,
        0x25,
        0xa8,
        0x49,
        0xe9,
        0x5b,
        0xb8,
        0xe8,
        0xb4,
        0xbf,
      ]),
      { plaintext: "custom-value", remainder: [] },
    );
  });
  it("decodes a string with extra bytes", () => {
    assertEquals(
      huffmanDecode([
        0x88,
        0x25,
        0xa8,
        0x49,
        0xe9,
        0x5b,
        0xa9,
        0x7d,
        0x7f,
        0x99,
      ]),
      { plaintext: "custom-key", remainder: [0x99] },
    );
    assertEquals(
      huffmanDecode([
        0x89,
        0x25,
        0xa8,
        0x49,
        0xe9,
        0x5b,
        0xb8,
        0xe8,
        0xb4,
        0xbf,
        0x99,
      ]),
      { plaintext: "custom-value", remainder: [0x99] },
    );
  });
});
