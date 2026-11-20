import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { streamToChunks } from "./helpers/stream-to-chunks.js";

// Streams rendered at the same time with the same context (e.g. a context shared by concurrent
// requests, or a component that streams a fragment elsewhere with `this`). Nested jsxToString
// calls (e.g. from an override) look up the stream of their context to stop on a cancel, so one
// stream must not stop or unstop the nested renders of another.

// Renders every element with a nested jsxToString call, like the README example.
function createContext() {
  return {
    jsxToString(element: JSX.Element) {
      return jsxToString.call(this, element);
    },
  };
}

function createItems(count: number, onCall: () => void = () => {}) {
  async function Item({ i }: { i: number }) {
    onCall();
    await delay(5);
    return <li>{i}</li>;
  }
  return Array.from({ length: count }, (_, i) => <Item i={i} />);
}

const expectedItems = (count: number) =>
  Array.from({ length: count }, (_, i) => `<li>${i}</li>`).join("");

// Delays the list, so its nested jsxToString call starts once the other stream started (or ended):
// a nested call looks up the stream of its context when it starts.
const Wait = ({ ms }: { ms: number }) => delay(ms, "");

test("cancelling a stream doesn't stop another stream with the same context", async () => {
  const context = createContext();
  const outer = jsxToStream.call(
    context,
    <div>
      <Wait ms={10} />
      <ul>{createItems(10)}</ul>
    </div>,
  );
  const outerChunks = streamToChunks(outer);
  // Starts before the outer list and is still rendering while it does.
  const inner = jsxToStream
    .call(
      context,
      <div>
        <ul>{createItems(10)}</ul>
      </div>,
    )
    .getReader();
  await inner.read();
  await delay(25);
  await inner.cancel();
  assert.strictEqual((await outerChunks).join(""), `<div><ul>${expectedItems(10)}</ul></div>`);
});

test("a stream cancel stops nested renders once another stream with the same context ended", async () => {
  const context = createContext();
  let calls = 0;
  const outer = jsxToStream
    .call(
      context,
      <div>
        <Wait ms={10} />
        <ul>{createItems(20, () => calls++)}</ul>
      </div>,
    )
    .getReader();
  assert.deepStrictEqual(await outer.read(), { done: false, value: "<div>" });
  // Starts and ends before the outer list starts.
  assert.deepStrictEqual(await streamToChunks(jsxToStream.call(context, <p>inner</p>)), [
    "<p>inner</p>",
  ]);
  await delay(30);
  const atCancel = calls;
  await outer.cancel();
  await delay(60);
  // At most the component that was already running when the reader cancelled.
  assert.ok(calls <= atCancel + 1, `${calls - atCancel} components called after cancel`);
});

test("cancelling every stream with the same context stops their nested renders", async () => {
  const context = createContext();
  let calls = 0;
  const render = (wait: number) =>
    jsxToStream
      .call(
        context,
        <div>
          <Wait ms={wait} />
          <ul>{createItems(20, () => calls++)}</ul>
        </div>,
      )
      .getReader();
  const first = render(0);
  const second = render(10);
  await Promise.all([first.read(), second.read()]);
  await delay(30);
  const atCancel = calls;
  await first.cancel();
  await second.cancel();
  await delay(60);
  // At most the components that were already running when the readers cancelled.
  assert.ok(calls <= atCancel + 2, `${calls - atCancel} components called after cancel`);
});
