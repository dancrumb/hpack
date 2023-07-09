import { TextLineStream } from "https://deno.land/std@0.192.0/streams/text_line_stream.ts";

const DICTIONARY_ENTRY = /.+\((...)\)\s+([01|]+)\s+[a-f0-9]+\s+\[\s*\d+\]/;

const appendix = await Deno.open("./rfc7541-appendix-b.txt");

const appendixContents = appendix.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());

const huffmanMap = new Map<number, string>();

for await (const line of appendixContents) {
  const match = line.match(DICTIONARY_ENTRY);
  if (match) {
    const [, value, codeString] = match;
    const code = codeString.replaceAll("|", "");

    console.log(`${value} => ${code}`);
    huffmanMap.set(parseInt(value), code);
  }
}

console.log(JSON.stringify(Array.from(huffmanMap.entries())));
