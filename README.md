# HPACK

This is a Deno implementation of the HPACK algorithm, as defined in
[RFC-7541](https://datatracker.ietf.org/doc/html/rfc7541).

This is generally intended to be used by HTTP/2 implementations, but can be used standalone.

```typescript
const encodingContext = new EncodingContext();
const decodingContext = new DecodingContext();

const encodingStream = () => new HPackEncoderStream(encodingContext);
const decodingStream = () => new HPackDecoderStream(decodingContext);

await readableStreamFromIterable(`
:status: 302
cache-control: private
date: Mon, 21 Oct 2013 20:13:21 GMT
location: https://www.example.com`)
  .pipeThrough(encodingStream())
  .pipeThrough(decodingStream());
```
