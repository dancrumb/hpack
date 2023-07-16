import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { readableStreamFromIterable } from "https://deno.land/std@0.194.0/streams/mod.ts";
import { DecodingContext } from "./decoding-context.ts";
import { EncodingContext } from "./encoding-context.ts";
import { HPackDecoderStream } from "./hpack-decoder-stream.ts";
import { HPackEncoderStream } from "./hpack-encoder-stream.ts";

const encodingContext = new EncodingContext();
const decodingContext = new DecodingContext();

const encodingStream = () => new HPackEncoderStream(encodingContext);
const decodingStream = () => new HPackDecoderStream(decodingContext);

const headers: string[] = [];
const arrayStream = new WritableStream({
  // Implement the sink
  write(chunk) {
    headers.push(chunk);
    return Promise.resolve();
  },
  close() {},
  abort(err) {
    console.log("Sink error:", err);
  },
});

await readableStreamFromIterable(`
:status: 302
cache-control: private
date: Mon, 21 Oct 2013 20:13:21 GMT
location: https://www.example.com`)
  .pipeThrough(encodingStream())
  .pipeThrough(decodingStream())
  .pipeTo(arrayStream, { preventClose: true });

await readableStreamFromIterable(`
:status: 307
cache-control: private
date: Mon, 21 Oct 2013 20:13:21 GMT
location: https://www.example.com`)
  .pipeThrough(encodingStream())
  .pipeThrough(decodingStream())
  .pipeTo(arrayStream, { preventClose: true });

await readableStreamFromIterable(`
:status: 200
cache-control: private
date: Mon, 21 Oct 2013 20:13:22 GMT
location: https://www.example.com
content-encoding: gzip
set-cookie: foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1`)
  .pipeThrough(encodingStream())
  .pipeThrough(decodingStream())
  .pipeTo(arrayStream);

console.log({ headers });

Deno.test("stream", () => {
  assertEquals(headers, [
    ":status: 302",
    "cache-control: private",
    "date: Mon, 21 Oct 2013 20:13:21 GMT",
    "location: https://www.example.com",

    ":status: 307",
    "cache-control: private",
    "date: Mon, 21 Oct 2013 20:13:21 GMT",
    "location: https://www.example.com",

    ":status: 200",
    "cache-control: private",
    "date: Mon, 21 Oct 2013 20:13:22 GMT",
    "location: https://www.example.com",
    "content-encoding: gzip",
    "set-cookie: foo=ASDJKHQKBZXOQWEOPIUAXQWEOIU; max-age=3600; version=1",
  ]);
});
