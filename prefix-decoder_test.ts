import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { decodeNumber } from "./prefix-decoder.ts";

describe("decodeNumber", () => {
  it("decode numbers with a prefix", () => {
    assertEquals(decodeNumber([10], 5), { plaintext: 10n, remainder: [] });
    assertEquals(decodeNumber([31, 154, 10], 5), {
      plaintext: 1337n,
      remainder: [],
    });
    assertEquals(decodeNumber([42], 8), { plaintext: 42n, remainder: [] });
  });

  it("ignores additional bytes", () => {
    assertEquals(
      decodeNumber([10, 54], 5),
      { plaintext: 10n, remainder: [54] },
      "10",
    );
    assertEquals(
      decodeNumber([31, 154, 10, 54], 5),
      { plaintext: 1337n, remainder: [54] },
      "1337",
    );
    assertEquals(
      decodeNumber([42, 54], 8),
      { plaintext: 42n, remainder: [54] },
      "42",
    );
  });
});
