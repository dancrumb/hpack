import { EncodingContext } from "./encoding-context.ts";
import headerDictionary from "./header-dictionary.json" with { type: "json" };

const headerMap = new Map<string, number>();
headerDictionary.forEach((entry, index) => {
  const key = `${entry.name}${entry.value === null ? "" : `: ${entry.value}`}`;
  headerMap.set(key, index);
});

export class HPackEncoderStream implements TransformStream<string, number[]> {
  readonly readable: ReadableStream<number[]>;
  readonly writable: WritableStream<string>;

  private transformer: TransformStream<string, number[]>;

  constructor(encodingContext = new EncodingContext()) {
    const queue: string[] = [];

    this.transformer = new TransformStream({
      transform: (chunk, controller) => {
        const previous = queue.shift() ?? "";

        `${previous}${chunk}`
          .split("\n")
          .filter((line) => line.length > 0)
          .forEach((line) => queue.push(line));

        const last = chunk.at(-1) === "\n" ? null : queue.pop() ?? null;

        let line = queue.shift();
        while (line !== undefined) {
          const [name, value] = line.split(": ");
          controller.enqueue(encodingContext.encodeHeader(name, value));
          line = queue.shift();
        }
        if (last !== null) {
          queue.push(last);
        }
      },
      flush: (controller) => {
        let line = queue.shift();
        while (line !== undefined) {
          const [name, value] = line.split(": ");
          controller.enqueue(encodingContext.encodeHeader(name, value));
          line = queue.shift();
        }
        controller.terminate();
      },
    });

    this.readable = this.transformer.readable;
    this.writable = this.transformer.writable;
  }
}
