import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
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
    then(resolve) {
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

test("stream cancel doesn't leave an override promise unhandled", async () => {
  const Slow = () => delay(20, "slow");
  const context = {
    jsxToString(element) {
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
