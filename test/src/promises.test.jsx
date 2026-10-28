import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { equal } from "./helpers/equal.js";
import { thenable } from "./helpers/thenable.js";

test("promise children", () =>
  equal(
    <p>
      {Promise.resolve(<b>a</b>)}
      {[Promise.resolve("b")]}
    </p>,
    `<p><b>a</b>b</p>`,
  ));

test("thenable children", () =>
  equal(
    <p>
      {thenable(<b>a</b>)}
      {[thenable("b")]}
    </p>,
    `<p><b>a</b>b</p>`,
  ));

test("array with promises", () =>
  equal([Promise.resolve(<b>a</b>), Promise.resolve("b")], `<b>a</b>b`));

test("promise as top-level element", () => equal(Promise.resolve(<p>a</p>), `<p>a</p>`));

test("thenable as top-level element", () => equal(thenable(<p>a</p>), `<p>a</p>`));

test("promise resolving to a promise", () =>
  equal(
    <p>{Promise.resolve({ then: (resolve) => resolve(Promise.resolve("a")) })}</p>,
    `<p>a</p>`,
  ));

test("component returning a thenable", () => {
  /** @type {any} */
  const Thenable = () => thenable(<i>t</i>);
  return equal(<Thenable />, `<i>t</i>`);
});

test("rejected top-level promise", () =>
  assert.rejects(() => jsxToString.call({}, Promise.reject(new Error("boom"))), /boom/));
