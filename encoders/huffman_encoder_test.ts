import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { huffmanEncode } from "./huffman_encoder.ts";

describe("huffmanEncode", () => {
  it("encodes an empty string", () => {
    assertEquals(huffmanEncode(""), [0x80]);
  });
  it("encodes a string", () => {
    assertEquals(
      huffmanEncode("custom-key"),
      [0x88, 0x25, 0xa8, 0x49, 0xe9, 0x5b, 0xa9, 0x7d, 0x7f],
    );
    assertEquals(
      huffmanEncode("custom-value"),
      [0x89, 0x25, 0xa8, 0x49, 0xe9, 0x5b, 0xb8, 0xe8, 0xb4, 0xbf],
    );
  });
});
