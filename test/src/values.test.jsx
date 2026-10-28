import test from "node:test";
import { equal } from "./helpers/equal.js";

test("boolean value", () => equal(false, ``));

test("number value", () => equal(5, `5`));

test("bigint value", () => equal(10n, `10`));

test("undefined value", () => equal(undefined, ``));

test("null value", () => equal(null, ``));

// equal() calls a function to get the JSX, so this one returns the function to render.
test("function value", () => equal(() => () => "x", ``));

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
