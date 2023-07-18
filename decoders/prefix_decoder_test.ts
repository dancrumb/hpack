import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { prefixDecode } from "./prefix_decoder.ts";

describe("decodeNumber", () => {
  it("decode numbers with a prefix", () => {
    assertEquals(prefixDecode([10], 5), { plaintext: 10n, remainder: [] });
    assertEquals(prefixDecode([31, 154, 10], 5), {
      plaintext: 1337n,
      remainder: [],
    });
    assertEquals(prefixDecode([42], 8), { plaintext: 42n, remainder: [] });
    assertEquals(prefixDecode([97], 6), { plaintext: 33n, remainder: [] });
  });

  it("ignores additional bytes", () => {
    assertEquals(
      prefixDecode([10, 54], 5),
      { plaintext: 10n, remainder: [54] },
      "10",
    );
    assertEquals(
      prefixDecode([31, 154, 10, 54], 5),
      { plaintext: 1337n, remainder: [54] },
      "1337",
    );
    assertEquals(
      prefixDecode([42, 54], 8),
      { plaintext: 42n, remainder: [54] },
      "42",
    );
    assertEquals(prefixDecode([97, 29], 6), {
      plaintext: 33n,
      remainder: [29],
    });
  });
});
