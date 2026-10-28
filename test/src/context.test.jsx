import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { streamToChunks } from "./helpers/stream-to-chunks.js";

test("render without 'this' context", async () =>
  assert.strictEqual(await jsxToString(<p>{"<b>"}</p>), `<p>&lt;b&gt;</p>`));

test("render without 'this' context gets a new empty context", async () => {
  function App() {
    const seen = this.user ?? "none";
    this.user = "ada";
    return (
      <p>
        {seen} <Greeting />
      </p>
    );
  }
  function Greeting() {
    return this.user;
  }
  // Each render starts with its own empty context, so nothing leaks between them.
  for (let i = 0; i < 2; i++) {
    assert.strictEqual(await jsxToString(<App />), `<p>none ada</p>`);
    assert.strictEqual((await streamToChunks(jsxToStream(<App />))).join(""), `<p>none ada</p>`);
  }
});

test("render via namespace import gets a new empty context", async () => {
  // `runtime.jsxToString(...)` passes the read-only module namespace as `this`.
  const runtime = await import("jsx-async-runtime");
  function App() {
    this.user = "ada";
    // The namespace's jsxToString export must not be taken for an override.
    assert.strictEqual(this.jsxToString, undefined);
    return (
      <div>
        <section>
          <Greeting />
        </section>
      </div>
    );
  }
  async function Greeting() {
    await delay(1);
    return <p>{this.user}</p>;
  }
  assert.strictEqual(
    await runtime.jsxToString(<App />),
    `<div><section><p>ada</p></section></div>`,
  );
  // Without an override, nested markup is still sent before the async component.
  assert.deepStrictEqual(await streamToChunks(runtime.jsxToStream(<App />)), [
    `<div><section>`,
    `<p>ada</p></section></div>`,
  ]);
});

test("custom jsxToString via context", async () => {
  const ctx = {
    async jsxToString(element) {
      return element?.tag === "b" ? "[B]" : jsxToString.call(this, element);
    },
  };
  assert.strictEqual(
    await jsxToString.call(
      ctx,
      <p>
        <b />
      </p>,
    ),
    `<p>[B]</p>`,
  );
});

test("override returning undefined or null renders nothing", async () => {
  const ctx = {
    jsxToString(element) {
      switch (element?.tag) {
        case "script":
          return undefined;
        case "style":
          return null;
        case "noscript":
          return Promise.resolve(undefined);
      }
      return jsxToString.call(this, element);
    },
  };
  const page = (
    <body>
      <script />
      <style />
      <noscript />
      <p>hi</p>
    </body>
  );
  assert.strictEqual(await jsxToString.call(ctx, page), `<body><p>hi</p></body>`);
  assert.strictEqual(
    (await streamToChunks(jsxToStream.call(ctx, page))).join(""),
    `<body><p>hi</p></body>`,
  );
});

test("override installed by a component applies to later siblings", async () => {
  const Footer = () => <footer>f</footer>;
  function installOverride() {
    const $jsxToString = this.jsxToString ?? jsxToString;
    this.jsxToString = function (element) {
      return element?.tag === Footer ? "[patched]" : $jsxToString.call(this, element);
    };
  }
  function SyncApp() {
    installOverride.call(this);
    return <main>app</main>;
  }
  async function AsyncApp() {
    installOverride.call(this);
    return <main>app</main>;
  }
  await equal(
    <>
      <SyncApp />
      <Footer />
    </>,
    `<main>app</main>[patched]`,
  );
  await equal(
    <>
      <AsyncApp />
      <Footer />
    </>,
    `<main>app</main>[patched]`,
  );
});
