import {
  assert,
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.193.0/testing/asserts.ts";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { DynamicTable } from "./dynamic-table.ts";

describe("DynamicTable", () => {
  describe("getIndex", () => {
    it("returns 0 for values that are not present", () => {
      const table = new DynamicTable();
      assertEquals(table.getIndex("foo: bar"), 0);
    });

    it("returns > 0 for values that are not present", () => {
      const table = new DynamicTable();
      table.addEntry("foo", "bar");
      assertEquals(table.getIndex("foo: bar"), 1);
    });
  });

  describe("size", () => {
    it("returns 0 for an empty table", () => {
      const table = new DynamicTable();
      assertEquals(table.size, 0);
    });
    it("returns >0 for a populated table", () => {
      const table = new DynamicTable();
      table.addEntry("foo", "bar");
      assertEquals(table.size, 38);
    });
  });

  describe("setMaxSize", () => {
    it("drops entries until the size is below the max size", () => {
      const table = new DynamicTable();
      table.addEntry("foo", "bar");
      table.setMaxSize(39);
      assertEquals(table.size, 38);
      table.setMaxSize(37);
      assertEquals(table.size, 0);
    });
  });

  describe("addEntry", () => {
    it("pushes older entries to higher indexes", () => {
      const table = new DynamicTable();
      table.addEntry("foo", "bar");
      assertEquals(table.getIndex("foo: bar"), 1);
      table.addEntry("baz", "qux");
      assertEquals(table.getIndex("foo: bar"), 2);
      assertEquals(table.getIndex("baz: qux"), 1);
    });
    it("drops older to avoid exceeding the max size", () => {
      const table = new DynamicTable();
      table.setMaxSize(39);
      table.addEntry("foo", "bar");
      assertEquals(table.getIndex("foo: bar"), 1);
      table.addEntry("baz", "qux");
      assertEquals(table.getIndex("foo: bar"), 0);
      assertEquals(table.getIndex("baz: qux"), 1);
    });
  });
});
