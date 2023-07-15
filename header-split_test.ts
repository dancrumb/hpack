import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";
import { headerSplit } from "./header-split.ts";

describe("headerSplit", () => {
  it("splits a simple header into a header and a value", () => {
    const [header, value] = headerSplit("foo: bar");
    assertEquals(header, "foo");
    assertEquals(value, "bar");
  });
  it("splits a special header into a header and a value", () => {
    const [header, value] = headerSplit(":foo: bar");
    assertEquals(header, ":foo");
    assertEquals(value, "bar");
  });
  it("splits a simple header into a header and a value containing colons", () => {
    const [header, value] = headerSplit("foo: bar:baz");
    assertEquals(header, "foo");
    assertEquals(value, "bar:baz");
  });
  it("splits a special header into a header and a value containing colons", () => {
    const [header, value] = headerSplit(":foo: bar:baz");
    assertEquals(header, ":foo");
    assertEquals(value, "bar:baz");
  });
  it("ignores missing whitespace", () => {
    const [header, value] = headerSplit("foo:bar");
    assertEquals(header, "foo");
    assertEquals(value, "bar");
  });
  it("ignores extra whitespace", () => {
    const [header, value] = headerSplit("  foo:   bar  ");
    assertEquals(header, "foo");
    assertEquals(value, "bar");
  });
});
