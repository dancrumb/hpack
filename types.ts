export type Header = {
  name: string;
  value: string;
};

export type PlainText<T> = { plaintext: T | null };

export type DecodeResult<T> = T & { remainder: number[] };
