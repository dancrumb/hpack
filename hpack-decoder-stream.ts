import { DecodingContext } from "./decoding-context.ts";
import headerDictionary from "./header-dictionary.json" with { type: "json" };

const headerMap = new Map<string, number>();
headerDictionary.forEach((entry, index) => {
  const key = `${entry.name}${entry.value === null ? "" : `: ${entry.value}`}`;
  headerMap.set(key, index);
});

export class HPackDecoderStream implements TransformStream<number[], string> {
  readonly readable: ReadableStream<string>;

  readonly writable: WritableStream<number[]>;

  private transformer: TransformStream<number[], string>;

  constructor(decodingContext = new DecodingContext()) {
    const queue: number[] = [];

    this.transformer = new TransformStream({
      transform: (chunk, controller) => {
        queue.push(...chunk);
        do {
          const { name, value, remainder } = decodingContext.decodeHeader(
            queue,
          );
          if (name === "") {
            break;
          }
          controller.enqueue(`${name}: ${value}`);
          queue.splice(0, Infinity, ...remainder);
        } while (queue.length > 0);
      },
      flush: (controller) => {
        do {
          const { name, value, remainder } = decodingContext.decodeHeader(
            queue,
          );
          if (name === "") {
            break;
          }
          controller.enqueue(`${name}: ${value}`);
          queue.splice(0, Infinity, ...remainder);
        } while (queue.length > 0);
        if (queue.length > 0) {
          controller.error(
            new Error(
              "Decoder stream has not been fully consumed; this indicates that some bytes are missing",
            ),
          );
        } else {
          controller.terminate();
        }
      },
    });

    this.readable = this.transformer.readable;
    this.writable = this.transformer.writable;
  }
}
