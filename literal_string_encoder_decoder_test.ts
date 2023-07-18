import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { literalDecode } from "./decoders/literal_string_decoder.ts";
import { literalEncode } from "./encoders/literal_string_encoder.ts";

describe("literalEncode/literalDecode", () => {
  it("encodes then decodes to the same string", () => {
    assertEquals(literalDecode(literalEncode("custom-key")), {
      plaintext: "custom-key",
      remainder: [],
    });
    assertEquals(literalDecode(literalEncode("custom-value")), {
      plaintext: "custom-value",
      remainder: [],
    });
  });
});
