import { createElement, jsxToString } from "jsx-async-runtime";
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
    <p>
      {Promise.resolve({
        then: (resolve: (value: unknown) => void) => resolve(Promise.resolve("a")),
      })}
    </p>,
    `<p>a</p>`,
  ));

test("component returning a thenable", () => {
  const Thenable = () => thenable(<i>t</i>);
  return equal(<Thenable />, `<i>t</i>`);
});

test("thenables type-check wherever promises do", () => {
  // The build type-checks this: thenables must be accepted like promises.
  const Card = ({ children }: { children: JSX.Element }) => <div>{children}</div>;
  return equal(
    <>
      <img src={thenable("a.png")} alt={thenable(null)} />
      <Card>{thenable("b")}</Card>
      {createElement("p", null, thenable("c"))}
    </>,
    `<img src="a.png"><div>b</div><p>c</p>`,
  );
});

test("functions with a then method are not awaited", async () => {
  let thenCalled = false;
  const thenableFunction = Object.assign(() => {}, {
    then() {
      thenCalled = true;
    },
  });
  const Component: any = () => thenableFunction;
  await equal(
    <p>
      {thenableFunction}
      <Component />
    </p>,
    `<p></p>`,
  );
  await equal(thenableFunction as any, ``);
  assert.strictEqual(thenCalled, false);
});

test("rejected top-level promise", () =>
  assert.rejects(async () => jsxToString.call({}, Promise.reject(new Error("boom"))), /boom/));
