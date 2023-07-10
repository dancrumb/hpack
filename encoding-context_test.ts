import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { EncodingContext } from "./encoding-context.ts";
import { hexDumpToArray } from "./hexdump-to-array.ts";

describe("EncodingContext", () => {
  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.3
  it("performs encoding without Huffman", () => {
    const encoder = new EncodingContext();
    // Request 1
    let result = [];
    result.push(...encoder.encodeHeader(":method", "GET"));
    result.push(...encoder.encodeHeader(":scheme", "http"));
    result.push(...encoder.encodeHeader(":path", "/"));
    result.push(...encoder.encodeHeader(":authority", "www.example.com"));
    assertEquals(
      result,
      [
        0x82, 0x86, 0x84, 0x41, 0x0f, 0x77, 0x77, 0x77, 0x2e, 0x65, 0x78, 0x61,
        0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d,
      ],
      "Request 1 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      57,
      "Dynamic table size after request 1"
    );

    result = [];
    result.push(...encoder.encodeHeader(":method", "GET"));
    result.push(...encoder.encodeHeader(":scheme", "http"));
    result.push(...encoder.encodeHeader(":path", "/"));
    result.push(...encoder.encodeHeader(":authority", "www.example.com"));
    result.push(...encoder.encodeHeader("cache-control", "no-cache"));
    assertEquals(
      result,
      [
        0x82, 0x86, 0x84, 0xbe, 0x58, 0x08, 0x6e, 0x6f, 0x2d, 0x63, 0x61, 0x63,
        0x68, 0x65,
      ],
      "Request 2 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      110,
      "Dynamic table size after request 2"
    );

    result = [];
    result.push(...encoder.encodeHeader(":method", "GET"));
    result.push(...encoder.encodeHeader(":scheme", "https"));
    result.push(...encoder.encodeHeader(":path", "/index.html"));
    result.push(...encoder.encodeHeader(":authority", "www.example.com"));
    result.push(...encoder.encodeHeader("custom-key", "custom-value"));
    assertEquals(
      result,
      [
        0x82, 0x87, 0x85, 0xbf, 0x40, 0x0a, 0x63, 0x75, 0x73, 0x74, 0x6f, 0x6d,
        0x2d, 0x6b, 0x65, 0x79, 0x0c, 0x63, 0x75, 0x73, 0x74, 0x6f, 0x6d, 0x2d,
        0x76, 0x61, 0x6c, 0x75, 0x65,
      ],
      "Request 3 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      164,
      "Dynamic table size after request 3"
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.4
  it("performs encoding without Huffman", () => {
    const encoder = new EncodingContext();
    // Request 1
    let result = [];
    result.push(...encoder.encodeHeader(":method", "GET", { huffman: true }));
    result.push(...encoder.encodeHeader(":scheme", "http", { huffman: true }));
    result.push(...encoder.encodeHeader(":path", "/", { huffman: true }));
    result.push(
      ...encoder.encodeHeader(":authority", "www.example.com", {
        huffman: true,
      })
    );
    assertEquals(
      result,
      [
        0x82, 0x86, 0x84, 0x41, 0x8c, 0xf1, 0xe3, 0xc2, 0xe5, 0xf2, 0x3a, 0x6b,
        0xa0, 0xab, 0x90, 0xf4, 0xff,
      ],
      "Request 1 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      57,
      "Dynamic table size after request 1"
    );

    // Request 2
    result = [];
    result.push(...encoder.encodeHeader(":method", "GET", { huffman: true }));
    result.push(...encoder.encodeHeader(":scheme", "http", { huffman: true }));
    result.push(...encoder.encodeHeader(":path", "/", { huffman: true }));
    result.push(
      ...encoder.encodeHeader(":authority", "www.example.com", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("cache-control", "no-cache", { huffman: true })
    );
    assertEquals(
      result,
      [0x82, 0x86, 0x84, 0xbe, 0x58, 0x86, 0xa8, 0xeb, 0x10, 0x64, 0x9c, 0xbf],
      "Request 2 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      110,
      "Dynamic table size after request 2"
    );

    // Request 3
    result = [];
    result.push(...encoder.encodeHeader(":method", "GET", { huffman: true }));
    result.push(...encoder.encodeHeader(":scheme", "https", { huffman: true }));
    result.push(
      ...encoder.encodeHeader(":path", "/index.html", { huffman: true })
    );
    result.push(
      ...encoder.encodeHeader(":authority", "www.example.com", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("custom-key", "custom-value", { huffman: true })
    );
    assertEquals(
      result,
      [
        0x82, 0x87, 0x85, 0xbf, 0x40, 0x88, 0x25, 0xa8, 0x49, 0xe9, 0x5b, 0xa9,
        0x7d, 0x7f, 0x89, 0x25, 0xa8, 0x49, 0xe9, 0x5b, 0xb8, 0xe8, 0xb4, 0xbf,
      ],
      "Request 3 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      164,
      "Dynamic table size after request 3"
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.5
  it("performs encoding without Huffman and a limited dynamic table", () => {
    const encoder = new EncodingContext(256);
    // Response 1
    let result = [];
    result.push(...encoder.encodeHeader(":status", "302"));
    result.push(...encoder.encodeHeader("cache-control", "private"));
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:21 GMT")
    );
    result.push(...encoder.encodeHeader("location", "https://www.example.com"));
    assertEquals(
      result,
      hexDumpToArray(`
      4803 3330 3258 0770 7269 7661 7465 611d
      4d6f 6e2c 2032 3120 4f63 7420 3230 3133
      2032 303a 3133 3a32 3120 474d 546e 1768
      7474 7073 3a2f 2f77 7777 2e65 7861 6d70
      6c65 2e63 6f6d`),

      "Response 1 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      222,
      "Dynamic table size after response 1"
    );

    // Response 2
    result = [];
    result.push(...encoder.encodeHeader(":status", "307"));
    result.push(...encoder.encodeHeader("cache-control", "private"));
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:21 GMT")
    );
    result.push(...encoder.encodeHeader("location", "https://www.example.com"));
    assertEquals(
      result,
      hexDumpToArray(`
      4803 3330 37c1 c0bf  `),

      "Response 2 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      222,
      "Dynamic table size after response 2"
    );

    // Response 3
    result = [];
    result.push(...encoder.encodeHeader(":status", "200"));
    result.push(...encoder.encodeHeader("cache-control", "private"));
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:22 GMT")
    );
    result.push(...encoder.encodeHeader("location", "https://www.example.com"));
    result.push(...encoder.encodeHeader("content-encoding", "gzip"));
    result.push(
      ...encoder.encodeHeader(
        "set-cookie",
        "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1"
      )
    );
    assertEquals(
      result,
      hexDumpToArray(`
   88c1 611d 4d6f 6e2c 2032 3120 4f63 7420
   3230 3133 2032 303a 3133 3a32 3220 474d
   54c0 5a04 677a 6970 7738 666f 6f3d 4153
   444a 4b48 514b 425a 584f 5157 454f 5049
   5541 5851 5745 4f49 553b 206d 6178 2d61
   6765 3d33 3630 303b 2076 6572 7369 6f6e
   3d31   `),
      "Response 3 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      215,
      "Dynamic table size after response 3"
    );
  });

  // Derived from https://datatracker.ietf.org/doc/html/rfc7541#appendix-C.6
  it("performs encoding with Huffman and a limited dynamic table", () => {
    const encoder = new EncodingContext(256);
    // Response 1
    let result = [];
    result.push(...encoder.encodeHeader(":status", "302", { huffman: true }));
    result.push(
      ...encoder.encodeHeader("cache-control", "private", { huffman: true })
    );
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:21 GMT", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("location", "https://www.example.com", {
        huffman: true,
      })
    );
    assertEquals(
      result,
      hexDumpToArray(`
   4882 6402 5885 aec3 771a 4b61 96d0 7abe 
   9410 54d4 44a8 2005 9504 0b81 66e0 82a6 
   2d1b ff6e 919d 29ad 1718 63c7 8f0b 97c8 
   e9ae 82ae 43d3                          `),

      "Response 1 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      222,
      "Dynamic table size after response 1"
    );

    // Response 2
    result = [];
    result.push(...encoder.encodeHeader(":status", "307", { huffman: true }));
    result.push(
      ...encoder.encodeHeader("cache-control", "private", { huffman: true })
    );
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:21 GMT", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("location", "https://www.example.com", {
        huffman: true,
      })
    );
    assertEquals(
      result,
      hexDumpToArray(`
      4883 640e ffc1 c0bf `),

      "Response 2 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      222,
      "Dynamic table size after response 2"
    );

    // Response 3
    result = [];
    result.push(...encoder.encodeHeader(":status", "200", { huffman: true }));
    result.push(
      ...encoder.encodeHeader("cache-control", "private", { huffman: true })
    );
    result.push(
      ...encoder.encodeHeader("date", "Mon, 21 Oct 2013 20:13:22 GMT", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("location", "https://www.example.com", {
        huffman: true,
      })
    );
    result.push(
      ...encoder.encodeHeader("content-encoding", "gzip", { huffman: true })
    );
    result.push(
      ...encoder.encodeHeader(
        "set-cookie",
        "foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1",
        { huffman: true }
      )
    );
    assertEquals(
      result,
      hexDumpToArray(`
      88c1 6196 d07a be94 1054 d444 a820 0595
      040b 8166 e084 a62d 1bff c05a 839b d9ab
      77ad 94e7 821d d7f2 e6c7 b335 dfdf cd5b
      3960 d5af 2708 7f36 72c1 ab27 0fb5 291f
      9587 3160 65c0 03ed 4ee5 b106 3d50 07  
      `),
      "Response 3 encoding"
    );
    assertEquals(
      encoder.dynamicTableSize,
      215,
      "Dynamic table size after response 3"
    );
  });
});
