import { html, isJsxNode, jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { streamToChunks } from "./helpers/stream-to-chunks.js";

test("render without 'this' context", async () =>
  assert.strictEqual(await jsxToString(<p>{"<b>"}</p>), `<p>&lt;b&gt;</p>`));

test("render without 'this' context gets a new empty context", async () => {
  function App(this: any) {
    const seen = this.user ?? "none";
    this.user = "ada";
    return (
      <p>
        {seen} <Greeting />
      </p>
    );
  }
  function Greeting(this: any) {
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
  function App(this: any) {
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
  async function Greeting(this: any) {
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

test("render via CommonJS interop copy of the module gets a new empty context", async () => {
  // TypeScript's `esModuleInterop` compiles `import * as runtime` to a plain object
  // with a getter per export, which `runtime.jsxToString(...)` passes as `this`.
  const namespace = await import("jsx-async-runtime");
  const runtime: any = {};
  for (const key of Object.keys(namespace)) {
    Object.defineProperty(runtime, key, { enumerable: true, get: () => (namespace as any)[key] });
  }
  function App(this: any) {
    const seen = this.user ?? "none";
    this.user = "ada";
    // The copy's jsxToString export must not be taken for an override.
    assert.strictEqual(this.jsxToString, undefined);
    return (
      <p>
        {seen} <Greeting />
      </p>
    );
  }
  function Greeting(this: any) {
    return this.user;
  }
  // The copy is shared by all renders, so a reused context would leak data between them.
  for (let i = 0; i < 2; i++) {
    assert.strictEqual(await runtime.jsxToString(<App />), `<p>none ada</p>`);
    assert.strictEqual(
      (await streamToChunks(runtime.jsxToStream(<App />))).join(""),
      `<p>none ada</p>`,
    );
  }
});

test("context holding the runtime's jsxToString is kept", async () => {
  // A context may hold `jsxToString`, so components can call `this.jsxToString(...)`.
  // It must not be taken for a copy of the module and replaced by an empty context.
  function App(this: any) {
    return (
      <div>
        <section>
          <Greeting />
        </section>
      </div>
    );
  }
  async function Greeting(this: any) {
    await delay(1);
    return <p>{this.user}</p>;
  }
  const context = () => ({ jsxToString, jsxToStream, user: "ada" });
  assert.strictEqual(
    await jsxToString.call(context(), <App />),
    `<div><section><p>ada</p></section></div>`,
  );
  // It renders like no override, so nested markup is still sent before the async component.
  assert.deepStrictEqual(await streamToChunks(jsxToStream.call(context(), <App />)), [
    `<div><section>`,
    `<p>ada</p></section></div>`,
  ]);
});

test("context holding several runtime exports is kept", async () => {
  // Only a context holding all function exports is taken for a copy of the module.
  function App(this: any) {
    return <p>{this.user}</p>;
  }
  const context = () => ({ jsxToString, jsxToStream, isJsxNode, html, user: "ada" });
  assert.strictEqual(await jsxToString.call(context(), <App />), `<p>ada</p>`);
  assert.strictEqual(
    (await streamToChunks(jsxToStream.call(context(), <App />))).join(""),
    `<p>ada</p>`,
  );
});

test("custom jsxToString via context", async () => {
  const ctx = {
    async jsxToString(element: any) {
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
    jsxToString(element: any) {
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

test("override returning something other than a string renders it like a child", async () => {
  const ctx = {
    jsxToString(element: any): any {
      switch (element?.tag) {
        case "b":
          // A replacement element; the override applies to its children too.
          return <strong>{element.props.children}</strong>;
        case "i":
          return element; // returning the given element must not loop
        case "em":
          return Promise.resolve(<span>{"<em>"}</span>);
        case "data":
          return 42;
        case "del":
          return false;
      }
      if (element === "secret") {
        return "***";
      }
      return jsxToString.call(this, element);
    },
  };
  const page = (
    <p>
      <b>
        <u>secret</u>
      </b>
      <i>x</i>
      <em />
      <data />
      <del />
    </p>
  );
  const expected = `<p><strong><u>***</u></strong><i>x</i><span>&lt;em&gt;</span>42</p>`;
  assert.strictEqual(await jsxToString.call(ctx, page), expected);
  assert.strictEqual((await streamToChunks(jsxToStream.call(ctx, page))).join(""), expected);
});

test("override installed by a component applies to later siblings", async () => {
  const Footer = () => <footer>f</footer>;
  function installOverride(this: any) {
    const $jsxToString = this.jsxToString ?? jsxToString;
    this.jsxToString = function (this: any, element: any) {
      return element?.tag === Footer ? "[patched]" : $jsxToString.call(this, element);
    };
  }
  function SyncApp(this: any) {
    installOverride.call(this);
    return <main>app</main>;
  }
  async function AsyncApp(this: any) {
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
