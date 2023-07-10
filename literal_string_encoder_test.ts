import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { literalEncode } from "./literal_string_encoder.ts";

describe("literalEncode", () => {
  it("encodes a string", () => {
    assertEquals(
      literalEncode("custom-key"),
      [0x0a, 0x63, 0x75, 0x73, 0x74, 0x6f, 0x6d, 0x2d, 0x6b, 0x65, 0x79],
    );
    assertEquals(
      literalEncode("custom-value"),
      [
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
      ],
    );
  });
});
