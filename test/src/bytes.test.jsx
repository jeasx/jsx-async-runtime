import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { equal } from "./helpers/equal.js";

test("bytes render as escaped UTF-8 text", () =>
  equal(<pre>{Buffer.from("a < b ü")}</pre>, `<pre>a &lt; b ü</pre>`));

test("Uint8Array renders as UTF-8 text", () =>
  equal(<pre>{new TextEncoder().encode("€ & co")}</pre>, `<pre>€ &amp; co</pre>`));

test("bytes as top-level element", () => equal(Buffer.from("ü"), `ü`));

test("component returning bytes", () => {
  const File = () => Buffer.from("<x>");
  return equal(
    <pre>
      <File />
    </pre>,
    `<pre>&lt;x&gt;</pre>`,
  );
});

test("bytes from another realm render as text", () =>
  equal(<p>{runInNewContext("new Uint8Array([104, 105])")}</p>, `<p>hi</p>`));

test("bytes are not escaped when escaping is off", async () => {
  assert.strictEqual(
    await jsxToString.call({ jsxEscapeHTML: false }, <p>{Buffer.from("<b>")}</p>),
    `<p><b></p>`,
  );
});

test("other typed arrays render like arrays of numbers", () =>
  equal(<p>{new Uint16Array([1, 2])}</p>, `<p>12</p>`));

test("byte stream renders as escaped UTF-8 text", () =>
  // A `fetch()` body is a stream of bytes, like this one.
  equal(() => <pre>{new Response("héllo <b>").body}</pre>, `<pre>héllo &lt;b&gt;</pre>`));

test("character split between byte chunks", () => {
  // "ü" is 0xc3 0xbc in UTF-8.
  const createStream = () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([0x61, 0xc3]));
        controller.enqueue(new Uint8Array([0xbc, 0x62]));
        controller.close();
      },
    });
  return equal(() => <p>{createStream()}</p>, `<p>aüb</p>`);
});

test("character split between byte children", () =>
  // "ü" is 0xc3 0xbc in UTF-8, e.g. chunks collected from a stream.
  equal(<p>{[new Uint8Array([0x61, 0xc3]), new Uint8Array([0xbc, 0x62])]}</p>, `<p>aüb</p>`));

test("character split between byte chunks of a generator", () => {
  function* chunks() {
    yield Buffer.from([0xe2, 0x82]);
    yield Buffer.from([0xac]);
    yield Buffer.from(" & co");
  }
  return equal(() => <p>{chunks()}</p>, `<p>€ &amp; co</p>`);
});

test("character split between byte children after an async sibling", () =>
  equal(
    <p>
      {Promise.resolve("x")}
      {new Uint8Array([0xc3])}
      {new Uint8Array([0xbc])}
    </p>,
    `<p>xü</p>`,
  ));

test("character cut off before a child that isn't bytes", () =>
  equal(
    <p>
      {new Uint8Array([0xc3])}
      {new Uint8Array([0xbc, 0xc3])}
      {"y"}
      {new Uint8Array([0xbc])}
    </p>,
    `<p>ü�y�</p>`,
  ));

test("character cut off at the end of the bytes", () => {
  async function* bytes() {
    yield new Uint8Array([0x61, 0xc3]);
  }
  return equal(() => <p>{bytes()}</p>, `<p>a\uFFFD</p>`);
});

test("bytes mixed with other async iterable items", () => {
  async function* items() {
    yield new Uint8Array([0xc3]);
    yield new Uint8Array([0xbc]);
    yield <b>x</b>;
    // Cut off by the next item.
    yield new Uint8Array([0xc3]);
    yield "y";
  }
  return equal(() => <p>{items()}</p>, `<p>ü<b>x</b>\uFFFDy</p>`);
});
