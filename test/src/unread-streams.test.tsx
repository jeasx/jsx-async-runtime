import { createElement, jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import { Readable } from "node:stream";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { renderers } from "./helpers/renderers.js";

// When a render fails or the stream reader cancels, streams that rendering never got to
// (e.g. a fetch() body) are cancelled, so they don't keep a connection open.

// Creates the JSX around a new stream, so each render gets its own.
type CreateJsx = (stream: ReadableStream<string>) => JSX.Element;

// Renders fresh JSX (from a factory, which gets a new stream) with both renderers and
// checks that the stream was cancelled with the render error, because rendering never read it.
async function cancelsUnreadStream(createJsx: CreateJsx, message: string) {
  for (const render of renderers) {
    let reason: Error | undefined;
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue("x");
        controller.close();
      },
      cancel(r: Error) {
        reason = r;
      },
    });
    await assert.rejects(async () => render(createJsx(stream)), { message });
    await delay(5);
    assert.strictEqual(reason?.message, message, "stream was not cancelled");
  }
}

test("unread stream is cancelled when an earlier sibling throws", () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  return cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        <p>{stream}</p>
      </div>
    ),
    "sibling",
  );
});

test("unread stream in a Set child is cancelled when an earlier sibling throws", () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  return cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        {new Set([stream])}
      </div>
    ),
    "sibling",
  );
});

test("unread stream as a Map key or value is cancelled when an earlier sibling throws", async () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  await cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        {new Map([[stream, "x"]])}
      </div>
    ),
    "sibling",
  );
  await cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        {new Map([["x", stream]])}
      </div>
    ),
    "sibling",
  );
});

test("unread stream in an array that contains itself is cancelled when an earlier sibling throws", () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  return cancelsUnreadStream((stream) => {
    const items: any[] = [stream];
    items.push(items);
    return (
      <div>
        <Boom />
        {items}
      </div>
    );
  }, "sibling");
});

test("unread stream is cancelled when an earlier async sibling fails", () => {
  const Boom = async () => {
    await delay(1);
    throw new Error("async sibling");
  };
  return cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        {stream}
      </div>
    ),
    "async sibling",
  );
});

test("unread stream is cancelled when the component it is passed to throws", () => {
  const Layout = (_props: object) => {
    throw new Error("layout");
  };
  return cancelsUnreadStream((stream) => {
    // The stream is only in what App returns, not in App's props.
    const App = () => <Layout>{stream}</Layout>;
    return (
      <main>
        <App />
      </main>
    );
  }, "layout");
});

test("unread stream is cancelled when an async component's markup fails", () => {
  const Layout = async (_props: object) => {
    throw new Error("async layout");
  };
  return cancelsUnreadStream((stream) => {
    const App = async () => <Layout>{stream}</Layout>;
    return <App />;
  }, "async layout");
});

test("unread stream is cancelled when a promise attribute of its parent rejects", () =>
  cancelsUnreadStream(
    (stream) => <div title={delay(1).then(() => Promise.reject(new Error("attr")))}>{stream}</div>,
    "attr",
  ));

test("unread stream from a promise child is cancelled", () => {
  const Boom = () => {
    throw new Error("before promise");
  };
  return cancelsUnreadStream(
    (stream) => (
      <div>
        <Boom />
        {delay(1, stream)}
      </div>
    ),
    "before promise",
  );
});

test("unread stream in an async iterable item is cancelled", () => {
  const Boom = () => {
    throw new Error("item");
  };
  return cancelsUnreadStream((stream) => {
    async function* items() {
      yield (
        <p>
          <Boom />
          {stream}
        </p>
      );
    }
    return <div>{items()}</div>;
  }, "item");
});

test("unread stream is cancelled when the stream reader cancels", async () => {
  let cancelled = false;
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const Slow = () => delay(10, "slow");
  const Next = () => "next";
  const reader = jsxToStream(
    <div>
      <Slow />
      <Next />
      {body}
    </div>,
  ).getReader();
  await reader.read();
  await reader.cancel();
  await delay(30);
  assert.ok(cancelled, "stream was not cancelled");
});

test("stream that was read is left alone when a later sibling throws", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    pull(controller) {
      controller.enqueue("x");
      controller.close();
    },
    cancel() {
      cancelled = true;
    },
  });
  const Boom = () => {
    throw new Error("after");
  };
  await assert.rejects(
    async () =>
      jsxToString(
        <div>
          {stream}
          <Boom />
        </div>,
      ),
    { message: "after" },
  );
  await delay(5);
  assert.strictEqual(cancelled, false);
});

test("stream passed as a non-children prop is left alone", async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const Boom = () => {
    throw new Error("prop");
  };
  const Body = ({ body }: { body: ReadableStream<string> }) => body;
  await assert.rejects(
    async () =>
      jsxToString(
        <div>
          <Boom />
          <Body body={stream} />
        </div>,
      ),
    { message: "prop" },
  );
  await delay(5);
  assert.strictEqual(cancelled, false);
});

// Children of void tags and of tags with an invalid name are never rendered,
// so their streams are cancelled even when the render succeeds.
async function cancelsSkippedStream(createJsx: CreateJsx, expected: string, message: string) {
  for (const render of renderers) {
    let reason: Error | undefined;
    const stream = new ReadableStream({
      cancel(r: Error) {
        reason = r;
      },
    });
    assert.strictEqual(await render(createJsx(stream)), expected);
    await delay(5);
    assert.strictEqual(reason?.message, message, "stream was not cancelled");
  }
}

test("stream in the children of a void tag is cancelled", () =>
  cancelsSkippedStream(
    (stream) => (
      <div>
        <br>{stream}</br>
      </div>
    ),
    "<div><br></div>",
    "Children of <br> are not rendered",
  ));

test("stream from a promise child of a void tag is cancelled", () =>
  cancelsSkippedStream(
    (stream) => <img src="a.png">{delay(1, stream)}</img>,
    '<img src="a.png">',
    "Children of <img> are not rendered",
  ));

test("stream in the children of a tag with an invalid name is cancelled", () =>
  cancelsSkippedStream(
    (stream) => <div>{createElement("a b", null, stream)}</div>,
    "<div></div>",
    "Children of <a b> are not rendered",
  ));

test("stream in the children of an undefined component is cancelled", () =>
  cancelsUnreadStream(
    (stream) => (
      <div>
        {
          // @ts-expect-error an undefined tag, e.g. from a missing import
          createElement(undefined, null, stream)
        }
      </div>
    ),
    "Invalid element type: expected a tag name or a component, got undefined. " +
      "Check for a missing import or a wrong default export.",
  ));

// Creates a Node.js stream that records whether it was destroyed.
// Without text, it never ends, so Node doesn't destroy it on its own after the end.
function createNodeStream(text?: string) {
  const state = { destroyed: false };
  const stream = new Readable({
    read() {
      if (text !== undefined) {
        this.push(text);
        this.push(null);
      }
    },
    destroy(error, callback) {
      state.destroyed = true;
      callback(error);
    },
  });
  return { stream, state };
}

test("unread Node.js stream is destroyed when an earlier sibling throws", async () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  for (const render of renderers) {
    const { stream, state } = createNodeStream("x");
    await assert.rejects(
      async () =>
        render(
          <div>
            <Boom />
            <p>{stream}</p>
          </div>,
        ),
      { message: "sibling" },
    );
    await delay(5);
    // Destroyed without an error, so no "error" event without listener crashes Node.
    assert.strictEqual(state.destroyed, true, "stream was not destroyed");
  }
});

test("Node.js stream that is being read is rendered and not destroyed early", async () => {
  const { stream } = createNodeStream("<b>");
  assert.strictEqual(await jsxToString(<p>{stream}</p>), "<p>&lt;b&gt;</p>");
});

test("Node.js stream that is already read elsewhere is left alone", async () => {
  const Boom = () => {
    throw new Error("sibling");
  };
  const { stream, state } = createNodeStream();
  stream.on("data", () => {});
  await assert.rejects(
    async () =>
      jsxToString(
        <div>
          <Boom />
          {stream}
        </div>,
      ),
    { message: "sibling" },
  );
  await delay(5);
  assert.strictEqual(state.destroyed, false);
  stream.destroy();
});
