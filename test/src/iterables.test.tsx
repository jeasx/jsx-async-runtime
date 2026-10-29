import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { equal } from "./helpers/equal.js";
import { rejects } from "./helpers/rejects.js";

test("array value", () => equal([<b>a</b>, [<i>b</i>], "<c>"], `<b>a</b><i>b</i>&lt;c&gt;`));

test("empty array value", () => equal([], ``));

test("nested arrays as children", () =>
  equal(<ul>{[[<li>a</li>], [[<li>b</li>]], []]}</ul>, `<ul><li>a</li><li>b</li></ul>`));

test("mapped children", () =>
  equal(
    <ul>
      {[1, 2, 3].map((i) => (
        <li>{i}</li>
      ))}
    </ul>,
    `<ul><li>1</li><li>2</li><li>3</li></ul>`,
  ));

test("Set as children", () => equal(<p>{new Set(["a", <b>b</b>])}</p>, `<p>a<b>b</b></p>`));

test("iterable as top-level element", () => equal(new Set([<b>a</b>, "b"]), `<b>a</b>b`));

test("iterator helper as children", () => {
  const users = new Map([
    [1, "Ada"],
    [2, "Linus"],
  ]);
  return equal(
    () => (
      <ul>
        {users.values().map((name) => (
          <li>{name}</li>
        ))}
      </ul>
    ),
    `<ul><li>Ada</li><li>Linus</li></ul>`,
  );
});

test("generator as children", () => {
  function* items() {
    yield <li>a</li>;
    yield [<li>b</li>, "c"];
  }
  return equal(() => <ul>{items()}</ul>, `<ul><li>a</li><li>b</li>c</ul>`);
});

test("generator children are read when rendered", () => {
  function* items() {
    yield "a";
  }
  const element = <p>{items()}</p>;
  // Like any iterator, a generator can be read only once.
  assert.strictEqual(jsxToString(element), `<p>a</p>`);
  assert.strictEqual(jsxToString(element), `<p></p>`);
});

test("component returning array", () => {
  const Items = () => [<li>a</li>, <li>b</li>];
  return equal(
    <ul>
      <Items />
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("async component returning array", () => {
  const Items = async () => [<li>a</li>, "b", null, 0];
  return equal(<Items />, `<li>a</li>b0`);
});

test("component returning a generator", () => {
  function* Items() {
    yield <li>a</li>;
    yield Promise.resolve(<li>b</li>);
  }
  return equal(
    <ul>
      <Items />
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("generator yielding bytes then a promise and text", () => {
  function* items() {
    yield Buffer.from([0x61, 0xc3]);
    yield Buffer.from([0xbc]);
    yield Promise.resolve(<b>b</b>);
    yield "c";
  }
  return equal(() => <p>{items()}</p>, `<p>aü<b>b</b>c</p>`);
});

test("generator is stopped when an item fails", async () => {
  let stopped = 0;
  let read = 0;
  function* items() {
    try {
      read++;
      yield "a";
      read++;
      yield Promise.reject(new Error("item failed"));
      read++;
      yield "c";
    } finally {
      stopped++;
    }
  }
  await rejects(() => <p>{items()}</p>, "item failed");
  assert.strictEqual(stopped, 2);
  assert.strictEqual(read, 4);
});

test("generator that throws fails the render", () => {
  function* items() {
    yield "a";
    throw new Error("source failed");
  }
  return rejects(() => <p>{items()}</p>, "source failed");
});

test("typed arrays other than bytes render their numbers", () =>
  equal(<p>{new Uint16Array([1, 2]) as any}</p>, `<p>12</p>`));

test("Map renders its entries", () =>
  equal(<p>{new Map([["a", <b>b</b>]]) as any}</p>, `<p>a<b>b</b></p>`));

test("iterator without Symbol.iterator of its own is read item by item", () => {
  const iterable = {
    [Symbol.iterator]() {
      let i = 0;
      return {
        next: () => (i < 2 ? { done: false, value: `${i++}` } : { done: true, value: undefined }),
      };
    },
  };
  return equal(<p>{iterable as any}</p>, `<p>01</p>`);
});
