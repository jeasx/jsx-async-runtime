import test from "node:test";
import { equal } from "./helpers/equal.js";

test("boolean value", () => equal(false, ``));

test("number value", () => equal(5, `5`));

test("bigint value", () => equal(10n, `10`));

test("undefined value", () => equal(undefined, ``));

test("null value", () => equal(null, ``));

// equal() calls a function to get the JSX, so this one returns the function to render.
test("function value", () => equal((() => () => "x") as any, ``));

test("zero as only child", () => equal(<h1>{0}</h1>, `<h1>0</h1>`));

test("zero with siblings", () => equal(<h1>{0} items</h1>, `<h1>0 items</h1>`));

test("number edge cases", () =>
  equal(
    <p>
      {-1}|{1.5}|{-0}
    </p>,
    `<p>-1|1.5|0</p>`,
  ));

test("bigint child", () => equal(<p>{10n}</p>, `<p>10</p>`));

test("empty string as only child", () => equal(<h1>{""}</h1>, `<h1></h1>`));

test("strings are not split into characters", () => equal(<p>{"abc"}</p>, `<p>abc</p>`));

test("null, undefined and boolean children are skipped", () =>
  equal(
    <p>
      {null}
      {undefined}
      {false}
      {true}a{1}
    </p>,
    `<p>a1</p>`,
  ));

test("function children of tags render nothing", () =>
  equal(
    <p>
      {() => "x"}a{() => "y"}
    </p>,
    `<p>a</p>`,
  ));

test("true conditional", () => equal(<>{"1" === String(1) && <div></div>}</>, `<div></div>`));

test("false conditional", () => equal(<>{"1" !== String(1) && <div></div>}</>, ``));

test("objects with their own string form render it escaped", () => {
  const date = new Date(0);
  const values: any = [
    date,
    "|",
    new URL("https://x.dev/?a=1&b=2"),
    "|",
    new Error("<b>"),
    "|",
    /a<b/g,
  ];
  return equal(
    <p>{values}</p>,
    `<p>${String(date)}|https://x.dev/?a=1&amp;b=2|Error: &lt;b&gt;|/a&lt;b/g</p>`,
  );
});

test("class instances with a toString method render it", () => {
  class Money {
    cents: number;
    constructor(cents: number) {
      this.cents = cents;
    }
    toString() {
      return `${(this.cents / 100).toFixed(2)} €`;
    }
  }
  class Price extends Money {}
  const values: any = [new Money(150), "|", new Price(99)];
  return equal(<p>{values}</p>, `<p>1.50 €|0.99 €</p>`);
});

test("iterables render their items, even with their own toString", () => {
  // Like in React, so collections with a debug toString (e.g. Immutable.js) render their elements.
  class Path {
    *[Symbol.iterator]() {
      yield <b>a</b>;
      yield <b>b</b>;
    }
    toString() {
      return "/a/b";
    }
  }
  const params = new URLSearchParams("a=1&b=2");
  const values: any = [new Path(), "|", params, "|", String(params)];
  return equal(<p>{values}</p>, `<p><b>a</b><b>b</b>|a1b2|a=1&amp;b=2</p>`);
});

test("plain objects and class instances without toString render nothing", () => {
  class Point {
    x = 1;
  }
  const values: any = [
    { a: 1 },
    Object.assign(Object.create(null), { a: 1 }),
    new Point(),
    JSON.parse(`{ "toString": "<script>" }`),
  ];
  return equal(<p>{values}</p>, `<p></p>`);
});
