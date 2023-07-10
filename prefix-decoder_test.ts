import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { decodeNumber } from "./prefix-decoder.ts";

describe("decodeNumber", () => {
  it("decode numbers with a prefix", () => {
    assertEquals(decodeNumber([10], 5), 10n);
    assertEquals(decodeNumber([31, 154, 10], 5), 1337n);
    assertEquals(decodeNumber([42], 8), 42n);
  });
});
