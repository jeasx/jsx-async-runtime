import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { rejects } from "./helpers/rejects.js";
import { renderers } from "./helpers/renderers.js";

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
  return equal(() => <pre>{createStream()}</pre>, `<pre>\n&lt;a&gt;b</pre>`);
});

test("a rendered readable stream is unlocked again", async () => {
  for (const render of renderers) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue("a");
        controller.close();
      },
    });
    assert.strictEqual(await render(<p>{stream}</p>), `<p>a</p>`);
    assert.strictEqual(stream.locked, false);
    // The stream is used up, but can still be handed to another reader.
    assert.deepStrictEqual(await stream.getReader().read(), { done: true, value: undefined });
  }
});

// A source that sends one chunk and then stalls, so rendering is stopped while reading it.
function createStalledStream(cancel?: () => void) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue("a");
    },
    cancel,
  });
}

test("a readable stream stopped by a failed render is unlocked again", async () => {
  const Boom = () => {
    throw new Error("boom");
  };
  for (const render of renderers) {
    // Rendering its first item fails, so the stream is stopped while it is being read.
    const stream = new ReadableStream<JSX.Element>({
      start(controller) {
        controller.enqueue(<Boom />);
      },
    });
    await assert.rejects(render(<p>{stream}</p>), { message: "boom" });
    await delay(10);
    assert.strictEqual(stream.locked, false);
  }
});

test("a readable stream whose source fails is unlocked again", async () => {
  for (const render of renderers) {
    const stream = new ReadableStream<JSX.Element>({
      pull(controller) {
        controller.error(new Error("source failed"));
      },
    });
    await assert.rejects(render(<p>{stream}</p>), { message: "source failed" });
    assert.strictEqual(stream.locked, false);
  }
});

test("a readable stream stopped by a stream cancel is unlocked again", async () => {
  for (const cancel of [
    undefined,
    () => {
      throw new Error("cancel failed");
    },
  ]) {
    const stream = createStalledStream(cancel);
    const reader = jsxToStream.call({}, <p>{stream}</p>).getReader();
    await reader.read();
    await reader.cancel(new Error("reader is done"));
    await delay(10);
    assert.strictEqual(stream.locked, false);
  }
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
