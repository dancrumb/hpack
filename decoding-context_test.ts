import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { hexDumpToArray } from "./hexdump-to-array.ts";
import { DecodingContext } from "./decoding-context.ts";
import { Header } from "./types.ts";

const assertDecodesCorrectly = (
  decoder: DecodingContext,
  code: number[],
  expectedResults: Header[],
  expectedRemainder: number[] = []
) => {
  let request = decoder.decodeHeader(code);
  expectedResults.forEach((expectedResult) => {
    assertEquals(
      request.name,
      expectedResult.name,
      `Name matches ${expectedResult.name}`
    );
    assertEquals(
      request.value,
      expectedResult.value,
      `Value matches ${expectedResult.value}`
    );
    request = decoder.decodeHeader(request.remainder);
  });
  assertEquals(request.remainder, expectedRemainder, "Remainder");
};

describe("DecodingContext", () => {
  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.3
  it("performs decoding without Huffman", () => {
    const decoder = new DecodingContext();
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`8286 8441 0f77 7777 2e65 7861 6d70 6c65 2e63 6f6d`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "http" },
        { name: ":path", value: "/" },
        { name: ":authority", value: "www.example.com" },
      ]
    );
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`8286 84be 5808 6e6f 2d63 6163 6865`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "http" },
        { name: ":path", value: "/" },
        { name: ":authority", value: "www.example.com" },
        { name: "cache-control", value: "no-cache" },
      ]
    );
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      8287 85bf 400a 6375 7374 6f6d 2d6b 6579
      0c63 7573 746f 6d2d 7661 6c75 65`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "https" },
        { name: ":path", value: "/index.html" },
        { name: ":authority", value: "www.example.com" },
        { name: "custom-key", value: "custom-value" },
      ]
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.4
  it("performs decoding with Huffman", () => {
    const decoder = new DecodingContext();
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`8286 8441 8cf1 e3c2 e5f2 3a6b a0ab 90f4
      ff `),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "http" },
        { name: ":path", value: "/" },
        { name: ":authority", value: "www.example.com" },
      ]
    );
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`8286 84be 5886 a8eb 1064 9cbf`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "http" },
        { name: ":path", value: "/" },
        { name: ":authority", value: "www.example.com" },
        { name: "cache-control", value: "no-cache" },
      ]
    );
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      8287 85bf 4088 25a8 49e9 5ba9 7d7f 8925
      a849 e95b b8e8 b4bf`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "https" },
        { name: ":path", value: "/index.html" },
        { name: ":authority", value: "www.example.com" },
        { name: "custom-key", value: "custom-value" },
      ]
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.5
  it("performs decoding without Huffman and a limited dynamic table", () => {
    const decoder = new DecodingContext();
    decoder.setMaxTableSize(256);
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      4803 3330 3258 0770 7269 7661 7465 611d
      4d6f 6e2c 2032 3120 4f63 7420 3230 3133
      2032 303a 3133 3a32 3120 474d 546e 1768
      7474 7073 3a2f 2f77 7777 2e65 7861 6d70
      6c65 2e63 6f6d `),
      [
        { name: ":status", value: "302" },
        { name: "cache-control", value: "private" },
        { name: "date", value: "Mon, 21 Oct 2013 20:13:21 GMT" },
        { name: "location", value: "https://www.example.com" },
      ]
    );
    assertDecodesCorrectly(decoder, hexDumpToArray(`4803 3330 37c1 c0bf`), [
      { name: ":status", value: "307" },
      { name: "cache-control", value: "private" },
      { name: "date", value: "Mon, 21 Oct 2013 20:13:21 GMT" },
      { name: "location", value: "https://www.example.com" },
    ]);
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      88c1 611d 4d6f 6e2c 2032 3120 4f63 7420
      3230 3133 2032 303a 3133 3a32 3220 474d
      54c0 5a04 677a 6970 7738 666f 6f3d 4153
      444a 4b48 514b 425a 584f 5157 454f 5049
      5541 5851 5745 4f49 553b 206d 6178 2d61
      6765 3d33 3630 303b 2076 6572 7369 6f6e
      3d31  `),
      [
        { name: ":status", value: "200" },
        { name: "cache-control", value: "private" },
        { name: "date", value: "Mon, 21 Oct 2013 20:13:22 GMT" },
        { name: "location", value: "https://www.example.com" },
        { name: "content-encoding", value: "gzip" },
        {
          name: "set-cookie",
          value: "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1",
        },
      ]
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.6
  it("performs decoding with Huffman and a limited dynamic table", () => {
    const decoder = new DecodingContext();
    decoder.setMaxTableSize(256);
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      4882 6402 5885 aec3 771a 4b61 96d0 7abe
      9410 54d4 44a8 2005 9504 0b81 66e0 82a6
      2d1b ff6e 919d 29ad 1718 63c7 8f0b 97c8
      e9ae 82ae 43d3 `),
      [
        { name: ":status", value: "302" },
        { name: "cache-control", value: "private" },
        { name: "date", value: "Mon, 21 Oct 2013 20:13:21 GMT" },
        { name: "location", value: "https://www.example.com" },
      ]
    );
    assertDecodesCorrectly(decoder, hexDumpToArray(`4883 640e ffc1 c0bf`), [
      { name: ":status", value: "307" },
      { name: "cache-control", value: "private" },
      { name: "date", value: "Mon, 21 Oct 2013 20:13:21 GMT" },
      { name: "location", value: "https://www.example.com" },
    ]);
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`
      88c1 6196 d07a be94 1054 d444 a820 0595
      040b 8166 e084 a62d 1bff c05a 839b d9ab
      77ad 94e7 821d d7f2 e6c7 b335 dfdf cd5b
      3960 d5af 2708 7f36 72c1 ab27 0fb5 291f
      9587 3160 65c0 03ed 4ee5 b106 3d50 07`),
      [
        { name: ":status", value: "200" },
        { name: "cache-control", value: "private" },
        { name: "date", value: "Mon, 21 Oct 2013 20:13:22 GMT" },
        { name: "location", value: "https://www.example.com" },
        { name: "content-encoding", value: "gzip" },
        {
          name: "set-cookie",
          value: "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1",
        },
      ]
    );
  });

  it("handles incomplete data", () => {
    const decoder = new DecodingContext();
    assertDecodesCorrectly(
      decoder,
      hexDumpToArray(`8286 8441 0f77 77`),
      [
        { name: ":method", value: "GET" },
        { name: ":scheme", value: "http" },
        { name: ":path", value: "/" },
        { name: "", value: "" },
      ],
      hexDumpToArray(`41 0f77 77`)
    );
  });
});
