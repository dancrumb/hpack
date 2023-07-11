import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { literalDecode } from "./literal_string_decoder.ts";

describe("literalDecode", () => {
  it("encodes a string", () => {
    assertEquals(
      literalDecode([
        0x0a,
        0x63,
        0x75,
        0x73,
        0x74,
        0x6f,
        0x6d,
        0x2d,
        0x6b,
        0x65,
        0x79,
      ]),
      { plaintext: "custom-key", remainder: [] },
    );
    assertEquals(
      literalDecode([
        0x0c,
        0x63,
        0x75,
        0x73,
        0x74,
        0x6f,
        0x6d,
        0x2d,
        0x76,
        0x61,
        0x6c,
        0x75,
        0x65,
      ]),
      { plaintext: "custom-value", remainder: [] },
    );
  });

  it("encodes a string with extra bytes", () => {
    assertEquals(
      literalDecode([
        0x0a,
        0x63,
        0x75,
        0x73,
        0x74,
        0x6f,
        0x6d,
        0x2d,
        0x6b,
        0x65,
        0x79,
        0x99,
      ]),
      { plaintext: "custom-key", remainder: [0x99] },
    );
    assertEquals(
      literalDecode([
        0x0c,
        0x63,
        0x75,
        0x73,
        0x74,
        0x6f,
        0x6d,
        0x2d,
        0x76,
        0x61,
        0x6c,
        0x75,
        0x65,
        0x99,
      ]),
      { plaintext: "custom-value", remainder: [0x99] },
    );
  });
});
