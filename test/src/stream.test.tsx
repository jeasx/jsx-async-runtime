import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import Timeout from "./components/Timeout.js";
import { delay } from "./helpers/delay.js";
import { streamToChunks } from "./helpers/stream-to-chunks.js";

test("stream sends sync markup as one chunk", async () =>
  assert.deepStrictEqual(
    await streamToChunks(
      jsxToStream(
        <p>
          <b>a</b>
          {"b"}
        </p>,
      ),
    ),
    [`<p><b>a</b>b</p>`],
  ));

test("stream of empty element closes without chunks", async () =>
  assert.deepStrictEqual(await streamToChunks(jsxToStream(<></>)), []));

test("stream flushes before waiting for async components", async () =>
  assert.deepStrictEqual(
    await streamToChunks(
      jsxToStream.call(
        {},
        <main>
          <h1>Title</h1>
          <Timeout>a</Timeout>
          <hr />
          {Promise.resolve("b")}
          <footer />
        </main>,
      ),
    ),
    [`<main><h1>Title</h1>`, `<div>a</div><hr>`, `b<footer></footer></main>`],
  ));

test("stream sends markup before a promise attribute", async () => {
  const chunks = await streamToChunks(
    jsxToStream(
      <main>
        <h1>head</h1>
        <img src={delay(5, "a.png")} />
      </main>,
    ),
  );
  assert.deepStrictEqual(chunks, [`<main><h1>head</h1>`, `<img src="a.png"></main>`]);
});

test("stream sends async iterable items as they arrive", async () => {
  async function* items() {
    yield <li>1</li>;
    await delay(5);
    yield <li>2</li>;
  }
  const chunks = await streamToChunks(jsxToStream(<ul>{items()}</ul>));
  // Like promise children, the markup so far is sent while waiting for each item.
  assert.deepStrictEqual(chunks, [`<ul>`, `<li>1</li>`, `<li>2</li>`, `</ul>`]);
});

test("stream splits large sync markup into chunks", async () => {
  const rows = Array.from({ length: 10000 }, (_, i) => <p>row {i}</p>);
  const chunks = await streamToChunks(jsxToStream(<div>{rows}</div>));
  assert.ok(chunks.length > 1, `got ${chunks.length} chunk(s)`);
  for (const chunk of chunks) {
    // A chunk ends at the first element boundary after 16 KB.
    assert.ok(chunk.length < 17 * 1024, `chunk of ${chunk.length} characters`);
  }
  assert.strictEqual(chunks.join(""), await jsxToString(<div>{rows}</div>));
});

test("stream waits for the reader", async () => {
  let calls = 0;
  const Item = async () => {
    calls++;
    await null;
    return "x".repeat(1000);
  };
  const items = Array.from({ length: 100 }, () => <Item />);
  const stream = jsxToStream.call({}, <div>{items}</div>);
  await delay(20);
  assert.ok(calls > 0 && calls < 100, `rendered ${calls} components without a read`);
  const markup = (await streamToChunks(stream)).join("");
  assert.strictEqual(calls, 100);
  assert.strictEqual(markup, `<div>${"x".repeat(100 * 1000)}</div>`);
});

test("stream pauses large sync markup for the reader", async () => {
  let calls = 0;
  const Item = () => {
    calls++;
    return "x".repeat(1000);
  };
  const items = Array.from({ length: 100 }, () => <Item />);
  const stream = jsxToStream.call({}, <div>{items}</div>);
  await delay(20);
  assert.ok(calls > 0 && calls < 100, `rendered ${calls} components without a read`);
  const markup = (await streamToChunks(stream)).join("");
  assert.strictEqual(calls, 100);
  assert.strictEqual(markup, `<div>${"x".repeat(100 * 1000)}</div>`);
});

test("stream errors on sync component error", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  return assert.rejects(streamToChunks(jsxToStream.call({}, <Broken />)), /boom/);
});

test("stream errors after sending markup rendered before an async error", async () => {
  const Broken = async () => {
    throw new Error("boom async");
  };
  const reader = jsxToStream
    .call(
      {},
      <p>
        a<Broken />
      </p>,
    )
    .getReader();
  assert.deepStrictEqual(await reader.read(), { done: false, value: "<p>a" });
  await assert.rejects(reader.read(), /boom async/);
});

test("stream cancelled while waiting doesn't crash and stops rendering", async () => {
  let calls = 0;
  const Slow = async () => {
    calls++;
    await new Promise((res) => setTimeout(res, 10));
    return "x";
  };
  const reader = jsxToStream
    .call(
      {},
      <p>
        a<Slow />b<Slow />c
      </p>,
    )
    .getReader();
  assert.deepStrictEqual(await reader.read(), { done: false, value: "<p>a" });
  await reader.cancel();
  await new Promise((res) => setTimeout(res, 50));
  assert.strictEqual(calls, 1);
});

test("stream cancelled before the last async component finishes doesn't crash", async () => {
  const reader = jsxToStream
    .call(
      {},
      <p>
        a<Timeout ms={10}>x</Timeout>b
      </p>,
    )
    .getReader();
  await reader.read();
  await reader.cancel();
  await new Promise((res) => setTimeout(res, 50));
});

test("stream cancelled while a promise child is pending stops before the next promise child", async () => {
  // A thenable records whether rendering ever waits for it.
  // No text between the promise children, so nothing is left to send when the
  // next one is reached: only the cancel check in flush() can stop the render there.
  let awaited = false;
  const next = {
    then(resolve: (value: string) => void) {
      awaited = true;
      resolve("y");
    },
  };
  const reader = jsxToStream
    .call(
      {},
      <p>
        a{new Promise((res) => setTimeout(() => res(null), 10))}
        {next}c
      </p>,
    )
    .getReader();
  assert.deepStrictEqual(await reader.read(), { done: false, value: "<p>a" });
  await reader.cancel();
  await new Promise((res) => setTimeout(res, 50));
  assert.strictEqual(awaited, false);
});

test("stream cancel ends the wait for a promise that never settles", async () => {
  // Rendering never gets to the body, so it's cancelled once rendering ends.
  // Before, the render kept waiting for the promise, so the body stayed open.
  let bodyCancelled = false;
  const body = new ReadableStream({
    cancel() {
      bodyCancelled = true;
    },
  });
  const never = new Promise<string>(() => {});
  const reader = jsxToStream
    .call(
      {},
      <p>
        a{never}
        {body}
      </p>,
    )
    .getReader();
  assert.deepStrictEqual(await reader.read(), { done: false, value: "<p>a" });
  await reader.cancel();
  await delay(10);
  assert.strictEqual(bodyCancelled, true);
});

test("stream cancel ends the wait inside a nested jsxToString", async () => {
  // An override renders each element with jsxToString, so the never-settling promise
  // is waited for in the nested writer, which shares the stream's cancel.
  let bodyCancelled = false;
  const body = new ReadableStream({
    cancel() {
      bodyCancelled = true;
    },
  });
  const Never = () => new Promise<string>(() => {});
  const context = {
    jsxToString(element: JSX.Element) {
      return jsxToString.call(this, element);
    },
  };
  const reader = jsxToStream
    .call(
      context,
      <div>
        a
        <p>
          <Never />
        </p>
        {body}
      </div>,
    )
    .getReader();
  // Nested jsxToString collects markup, so nothing is sent until the nested element is done.
  const read = reader.read();
  await delay(10);
  await reader.cancel();
  await read;
  await delay(10);
  assert.strictEqual(bodyCancelled, true);
});

test("stream cancel stops a paused render", async () => {
  let calls = 0;
  const Item = async () => {
    calls++;
    await null;
    return "x".repeat(1000);
  };
  const items = Array.from({ length: 100 }, () => <Item />);
  const stream = jsxToStream.call({}, <div>{items}</div>);
  await delay(20);
  const paused = calls;
  await stream.cancel();
  await delay(20);
  assert.ok(calls <= paused + 1, `rendered ${calls - paused} components after cancel`);
});

test("stream cancel stops an async iterable", async () => {
  let pulled = 0;
  let stopped = false;
  async function* items() {
    try {
      for (;;) {
        pulled++;
        yield "x".repeat(1000);
        await delay(5);
      }
    } finally {
      stopped = true;
    }
  }
  const stream = jsxToStream(<div>{items()}</div>);
  const reader = stream.getReader();
  await reader.read();
  await reader.cancel();
  const afterCancel = pulled;
  await delay(30);
  assert.ok(stopped, "source was not stopped");
  assert.ok(pulled <= afterCancel + 1, `pulled ${pulled - afterCancel} items after cancel`);
});

test("stream cancel stops an async iterable that is waiting for its next item", async () => {
  // A source that never sends another item, e.g. a live feed that went quiet.
  // Unlike an async generator, its return() runs right away, so it shows when the render stops.
  let stopped = false;
  let first = true;
  const source: AsyncIterable<string> = {
    [Symbol.asyncIterator]: () => ({
      next: () =>
        first
          ? ((first = false), Promise.resolve({ done: false, value: "a" }))
          : new Promise<IteratorResult<string>>(() => {}),
      return: async () => {
        stopped = true;
        return { done: true, value: undefined };
      },
    }),
  };
  const reader = jsxToStream(<div>{source}</div>).getReader();
  let received = "";
  while (!received.includes("a")) {
    received += (await reader.read()).value;
  }
  await reader.cancel();
  await delay(10);
  assert.ok(stopped, "source was not stopped");
});

test("an async iterable reached after the stream was cancelled leaves no unhandled rejection", async () => {
  async function* items() {
    yield "a";
  }
  let unhandled: unknown;
  const onUnhandled = (error: unknown) => (unhandled = error);
  process.on("unhandledRejection", onUnhandled);
  try {
    // The promise child resolves after the cancel, so the iterable is rendered
    // with the stream already cancelled and never asked for an item.
    const reader = jsxToStream(<div>{delay(10).then(() => items())}</div>).getReader();
    await reader.read();
    await reader.cancel();
    await delay(30);
  } finally {
    process.off("unhandledRejection", onUnhandled);
  }
  assert.equal(unhandled, undefined);
});

test("stream cancel doesn't leave an override promise unhandled", async () => {
  const Slow = () => delay(20, "slow");
  const context = {
    jsxToString(element: JSX.Element) {
      if (element === "after") {
        return Promise.reject(new Error("override failed"));
      }
      return jsxToString.call({}, element);
    },
  };
  const stream = jsxToStream.call(
    context,
    <div>
      <Slow />
      after
    </div>,
  );
  const reader = stream.getReader();
  await reader.read();
  await reader.cancel();
  // An unhandled rejection would fail this test.
  await delay(50);
});

test("stream cancel stops rendering inside a jsxToString override", async () => {
  let calls = 0;
  async function Item({ i }: { i: number }) {
    calls++;
    await delay(5);
    return <li>{i}</li>;
  }
  // Like the README example: every element is rendered by a nested jsxToString call.
  const context = {
    jsxToString(element: JSX.Element) {
      return jsxToString.call(this, element);
    },
  };
  // The root tag isn't rendered by the override, so `<div>` is sent while the list renders.
  const reader = jsxToStream
    .call(
      context,
      <div>
        <ul>
          {Array.from({ length: 20 }, (_, i) => (
            <Item i={i} />
          ))}
        </ul>
      </div>,
    )
    .getReader();
  assert.deepStrictEqual(await reader.read(), { done: false, value: "<div>" });
  await delay(12);
  const atCancel = calls;
  await reader.cancel();
  await delay(60);
  // The component that was running may finish, but no new one starts.
  assert.ok(calls <= atCancel + 1, `${calls - atCancel} components called after cancel`);
});

test("stream cancel stops an async iterable inside a jsxToString override", async () => {
  let pulled = 0;
  let stopped = false;
  // Limited, so the test fails instead of running forever if the source isn't stopped.
  async function* Rows() {
    try {
      while (pulled < 100) {
        await delay(5);
        pulled++;
        yield <li>{pulled}</li>;
      }
    } finally {
      stopped = true;
    }
  }
  const context = {
    jsxToString(element: JSX.Element) {
      return jsxToString.call(this, element);
    },
  };
  const reader = jsxToStream
    .call(
      context,
      <ul>
        <Rows />
      </ul>,
    )
    .getReader();
  await reader.read();
  await delay(20);
  const atCancel = pulled;
  await reader.cancel();
  await delay(30);
  assert.ok(stopped, "source was not stopped");
  assert.ok(pulled <= atCancel + 1, `pulled ${pulled - atCancel} items after cancel`);
});

test("a context can be rendered again after its stream was cancelled", async () => {
  const Slow = () => delay(10, <p>slow</p>);
  const context = {};
  const reader = jsxToStream
    .call(
      context,
      <div>
        a<Slow />
      </div>,
    )
    .getReader();
  await reader.read();
  await reader.cancel();
  // Wait until the cancelled render has ended.
  await delay(30);
  assert.strictEqual(await jsxToString.call(context, <Slow />), `<p>slow</p>`);
});

test("stream of a long async iterable doesn't grow memory per item", async () => {
  // Measured with gc between samples. A leak of a cancel listener per item
  // grew the heap by about 250 bytes per item, so 200k items added about 50 MB.
  setFlagsFromString("--expose-gc");
  const gc = runInNewContext("gc") as () => void;
  const heap: number[] = [];
  async function* items() {
    for (let i = 0; i <= 200_000; i++) {
      if (i % 100_000 === 0) {
        gc();
        heap.push(process.memoryUsage().heapUsed);
      }
      await null;
      yield "";
    }
  }
  await streamToChunks(jsxToStream(<p>{items()}</p>));
  const growth = heap.at(-1)! - heap[0]!;
  assert.ok(growth < 10_000_000, `heap grew by ${(growth / 1e6).toFixed(1)} MB`);
});

test("stream sends a long generator before reading all of it", async () => {
  let read = 0;
  function* rows() {
    for (let i = 0; i < 100_000; i++) {
      read++;
      yield <li>{i}</li>;
    }
  }
  const reader = jsxToStream(<ul>{rows()}</ul>).getReader();
  const first = await reader.read();
  assert.ok(first.value!.startsWith("<ul><li>0</li>"));
  assert.ok(read < 10_000, `read ${read} items before the first chunk`);
  await reader.cancel();
});

test("stream sends a long iterable object before reading all of it", async () => {
  // Its `[Symbol.iterator]()` returns a new generator each time, unlike a generator itself.
  let read = 0;
  const rows = {
    *[Symbol.iterator]() {
      for (let i = 0; i < 100_000; i++) {
        read++;
        yield <li>{i}</li>;
      }
    },
  };
  const reader = jsxToStream(<ul>{rows as any}</ul>).getReader();
  const first = await reader.read();
  assert.ok(first.value!.startsWith("<ul><li>0</li>"));
  assert.ok(read < 10_000, `read ${read} items before the first chunk`);
  await reader.cancel();
});

test("stream cancel stops an endless iterable object", async () => {
  let read = 0;
  let stopped = false;
  const items = {
    *[Symbol.iterator]() {
      try {
        for (;;) {
          read++;
          yield "x".repeat(1000);
        }
      } finally {
        stopped = true;
      }
    },
  };
  const reader = jsxToStream(<div>{items as any}</div>).getReader();
  await reader.read();
  await reader.cancel();
  const afterCancel = read;
  await delay(20);
  assert.ok(stopped, "iterator was not stopped");
  assert.ok(read <= afterCancel + 1, `read ${read - afterCancel} items after cancel`);
});

test("stream cancel stops an endless generator", async () => {
  let read = 0;
  let stopped = false;
  function* items() {
    try {
      for (;;) {
        read++;
        yield "x".repeat(1000);
      }
    } finally {
      stopped = true;
    }
  }
  const reader = jsxToStream(<div>{items()}</div>).getReader();
  await reader.read();
  await reader.cancel();
  const afterCancel = read;
  await delay(20);
  assert.ok(stopped, "generator was not stopped");
  assert.ok(read <= afterCancel + 1, `read ${read - afterCancel} items after cancel`);
});
