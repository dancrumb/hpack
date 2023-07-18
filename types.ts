export type Header = {
  name: string;
  value: string;
};

export type PlainText<T> = { plaintext: T | null };

export type DecodeResult<T> = T & { remainder: number[] };

export type Encoder<T = string> = T extends number
  ? (value: number, prefix: number) => number[]
  : (value: T) => number[];
export type Decoder<T = string> = T extends number | bigint
  ? (code: number[], prefix: number) => DecodeResult<PlainText<T>>
  : (code: number[]) => DecodeResult<PlainText<T>>;
