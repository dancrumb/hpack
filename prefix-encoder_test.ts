import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { encodeNumber } from "./prefix-encoder.ts";

describe("encodeNumber", () => {
  it("encodes numbers with a prefix", () => {
    assertEquals(encodeNumber(10, 5), [10]);
    assertEquals(encodeNumber(1337, 5), [31, 154, 10]);
    assertEquals(encodeNumber(42, 8), [42]);
  });
});
