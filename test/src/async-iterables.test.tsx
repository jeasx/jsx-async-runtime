import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { rejects } from "./helpers/rejects.js";

test("async generator as children", () => {
  async function* items() {
    yield <li>a</li>;
    await delay(5);
    yield "b & c";
    yield [1, <b>2</b>];
  }
  return equal(() => <ul>{items()}</ul>, `<ul><li>a</li>b &amp; c1<b>2</b></ul>`);
});

test("async generator component", () => {
  async function* List({ count }: { count: number }) {
    for (let i = 0; i < count; i++) {
      await delay(1);
      yield <li>{i}</li>;
    }
  }
  return equal(
    <ul>
      <List count={3} />
      <li>end</li>
    </ul>,
    `<ul><li>0</li><li>1</li><li>2</li><li>end</li></ul>`,
  );
});

test("async iterable items can be async", () => {
  const Async = async () => <i>async</i>;
  async function* items() {
    yield <Async />;
    yield delay(5, "promise");
  }
  return equal(() => <p>{items()}</p>, `<p><i>async</i>promise</p>`);
});

test("async iterable passed directly", async () => {
  async function* items() {
    yield <b>x</b>;
  }
  assert.strictEqual(await jsxToString(items()), `<b>x</b>`);
});

test("readable stream as children", () => {
  const createStream = () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue("<a>");
        controller.enqueue("b");
        controller.close();
      },
    });
  return equal(() => <pre>{createStream()}</pre>, `<pre>&lt;a&gt;b</pre>`);
});

test("async iterable uses the jsxToString override", async () => {
  async function* items() {
    yield "a";
    yield "b";
  }
  const context = {
    jsxToString(element: JSX.Element) {
      return typeof element === "string" ? element.toUpperCase() : jsxToString.call(this, element);
    },
  };
  assert.strictEqual(await jsxToString.call(context, <p>{items()}</p>), `<p>AB</p>`);
});

test("async iterable source error rejects", () =>
  rejects(() => {
    async function* items() {
      yield "a";
      throw new Error("source");
    }
    return <p>{items()}</p>;
  }, "source"));

test("async iterable item error stops the source", async () => {
  let stopped = 0;
  const Boom = () => {
    throw new Error("item");
  };
  const createJsx = () => {
    async function* items() {
      try {
        yield "a";
        yield <Boom />;
        yield "never";
      } finally {
        stopped++;
      }
    }
    return <p>{items()}</p>;
  };
  await rejects(createJsx, "item");
  assert.strictEqual(stopped, 2);
});
