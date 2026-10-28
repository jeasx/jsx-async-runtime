import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { equal } from "./helpers/equal.js";

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
