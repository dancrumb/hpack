import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { encodeNumber } from "./prefix-encoder.ts";
import { prefixDecode } from "./prefix-decoder.ts";

describe("encodeNumber/decodeNumber", () => {
  it("encodes then decodes to the same number", () => {
    assertEquals(prefixDecode(encodeNumber(10, 5), 5), {
      plaintext: 10n,
      remainder: [],
    });
    assertEquals(prefixDecode(encodeNumber(1337, 5), 5), {
      plaintext: 1337n,
      remainder: [],
    });
    assertEquals(prefixDecode(encodeNumber(42, 8), 8), {
      plaintext: 42n,
      remainder: [],
    });
    assertEquals(prefixDecode(encodeNumber(12345678, 6), 6), {
      plaintext: 12345678n,
      remainder: [],
    });
  });
});
