import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { huffmanDecode } from "./decoders/huffman_decoder.ts";
import { huffmanEncode } from "./encoders/huffman_encoder.ts";

describe("huffmanEncode/huffmanDecode", () => {
  it("encodes then decodes an empty string", () => {
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
