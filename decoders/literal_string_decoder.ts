import { Decoder } from "../types.ts";
import { prefixDecode } from "./prefix_decoder.ts";

export const literalDecode: Decoder = (code: number[]) => {
  const { plaintext: length, remainder: codetext } = prefixDecode(code, 7);
  const [string, remainder] = [
    codetext.slice(0, Number(length)),
    codetext.slice(Number(length)),
  ];

  if (string.length < Number(length)) {
    return { plaintext: null, remainder: code };
  }
  return {
    plaintext: new TextDecoder().decode(new Uint8Array(string).buffer),
    remainder,
  };
};
