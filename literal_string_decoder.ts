import { prefixDecode } from "./prefix-decoder.ts";
import { DecodeResult, PlainText } from "./types.ts";

export function literalDecode(code: number[]): DecodeResult<PlainText<string>> {
  const { plaintext: length, remainder: codetext } = prefixDecode(code, 7);
  const [string, remainder] = [
    codetext.slice(0, Number(length)),
    codetext.slice(Number(length)),
  ];

  return {
    plaintext: new TextDecoder().decode(new Uint8Array(string).buffer),
    remainder,
  };
}
