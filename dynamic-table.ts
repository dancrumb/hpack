import { headerSplit } from "./header-split.ts";
import { Header } from "./types.ts";

export class DynamicTable {
  readonly table: string[] = [];

  /**
   * Creates a new table.
   *
   * The maximum size in bytes can be set; it defaults to 1024 bytes
   */
  constructor(private maxSize = 1024) {}

  private dropUntilBelowMaxSize() {
    while (this.size > this.maxSize) {
      this.table.pop();
    }
  }

  /**
   * Sets the maximum size of the dynamic table.
   *
   * Note, this is not the maximum number of entries, but the maximum size in bytes.
   */
  setMaxSize(size: number) {
    this.maxSize = size;
    this.dropUntilBelowMaxSize();
  }

  /**
   * Gets the current size of the table. This is the sum of the size of all entries.
   */
  get size(): number {
    return this.table.reduce((sum, entry) => {
      return sum + (entry.length - 2) + 32; // -2 is for the colon and space;
    }, 0);
  }

  /**
   * Adds a field to the table.
   * Per the spec, this pushes older entries to higher indexes and drops the oldest entries to ensure
   * that the max size is not exceeded.
   */
  addEntry(name: string, value: string) {
    this.table.unshift(`${name}: ${value}`);
    this.dropUntilBelowMaxSize();
  }

  /**
   * Returns the index of the provided field, or 0 if it is not present.
   */
  getIndex(field: string): number {
    return this.table.indexOf(field) + 1;
  }

  getField(index: number): Header | undefined {
    const field = this.table[index - 1];
    if (field === undefined) {
      return undefined;
    }
    const [name, value] = headerSplit(field);
    return { name, value };
  }
}
