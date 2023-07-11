import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { huffmanEncode } from "./huffman-encoder.ts";
import { huffmanDecode } from "./huffman-decoder.ts";

describe("huffmanEncode/huffmanDecode", () => {
  it("encodes then decodesan empty string", () => {
    assertEquals(huffmanDecode(huffmanEncode("")), {
      plaintext: "",
      remainder: [],
    });
  });
  it("encodes a string", () => {
    assertEquals(huffmanDecode(huffmanEncode("custom-key")), {
      plaintext: "custom-key",
      remainder: [],
    });
    assertEquals(huffmanDecode(huffmanEncode("custom-value")), {
      plaintext: "custom-value",
      remainder: [],
    });
  });
});
