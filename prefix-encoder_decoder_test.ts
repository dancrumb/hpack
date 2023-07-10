import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { encodeNumber } from "./prefix-encoder.ts";
import { decodeNumber } from "./prefix-decoder.ts";

describe("encodeNumber/decodeNumber", () => {
  it("encodes then decodes to the same number", () => {
    assertEquals(decodeNumber(encodeNumber(10, 5), 5), 10n);
    assertEquals(decodeNumber(encodeNumber(1337, 5), 5), 1337n);
    assertEquals(decodeNumber(encodeNumber(42, 8), 8), 42n);
    assertEquals(decodeNumber(encodeNumber(12345678, 6), 6), 12345678n);
  });
});
