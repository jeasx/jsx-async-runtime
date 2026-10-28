import {
  createElement as classicCreateElement,
  escapeEntities,
  Fragment,
  html,
  jsxToStream,
  jsxToString,
} from "jsx-async-runtime";
import { jsxDEV } from "jsx-async-runtime/jsx-dev-runtime";
import { createElement } from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Headline from "./components/Headline.js";
import Html from "./components/Html.js";
import Layout from "./components/Layout.js";
import Timeout from "./components/Timeout.js";

async function equal(jsx, str) {
  assert.strictEqual(await jsxToString.call({}, jsx), str);
  assert.strictEqual((await streamToChunks(jsxToStream.call({}, jsx))).join(""), str);
}

async function streamToChunks(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

test("fragments", () =>
  equal(
    <>
      <main>
        <>
          <div>
            <Headline />
          </div>
        </>
      </main>
    </>,
    `<main><div><h1>Hello World</h1></div></main>`,
  ));

test("boolean attributes", () =>
  equal(
    <div
      hidden
      autocapitalize="off"
      contenteditable={true}
      itemscope={false}
      defer=""
      autofocus="autofocus"
    />,
    `<div hidden autocapitalize="off" contenteditable defer="" autofocus="autofocus"></div>`,
  ));

test("null or undefined attributes", () =>
  equal(<div id={null} title={undefined} />, `<div></div>`));

test("void tags", () =>
  equal(
    <>
      <hr />
      <br />
      <img src="src" alt="" />
      <link href="/" />
      <input type="text" />
    </>,
    `<hr><br><img src="src" alt=""><link href="/"><input type="text">`,
  ));

test("void tags ignore children", () => {
  let called = false;
  const Child = () => {
    called = true;
    return "x";
  };
  return equal(
    <>
      <br>text</br>
      <img src="src">
        <Child />
      </img>
    </>,
    `<br><img src="src">`,
  ).then(() => assert.equal(called, false));
});

test("void tags ignore case", () =>
  equal(
    // Capitalized JSX names are components, so build the tags with createElement.
    <>
      {classicCreateElement("BR")}
      {classicCreateElement("Img", { src: "src" }, "text")}
    </>,
    `<BR><Img src="src">`,
  ));

test("empty fragment", () => equal(<></>, ``));

test("class as string", () => equal(<div class="a b c"></div>, `<div class="a b c"></div>`));

test("class as empty string", () => equal(<div class=""></div>, `<div class=""></div>`));

test("class as object", () => {
  const className1 = "";
  const className2 = "hidden";
  const className3 = undefined;
  return equal(
    <div
      class={{
        striped: false,
        sticky: true,
        highlight: true,
        [className1]: !!className1,
        [className2]: !!className2,
        [className3]: !!className3,
      }}
    ></div>,
    `<div class="sticky highlight hidden"></div>`,
  );
});

test("class as empty object", () =>
  equal(<div class={{ highlight: false, sticky: undefined }}></div>, "<div></div>"));

test("class as array", () =>
  equal(<div class={["a", "b", undefined, "c", null, ""]}></div>, `<div class="a b c"></div>`));

test("class as empty array", () => equal(<div class={[]}></div>, `<div></div>`));

test("class as nested array", () =>
  equal(
    <div class={["a", ["b", ["c", false]], [], null, "d"]}></div>,
    `<div class="a b c d"></div>`,
  ));

test("class as array with objects", () =>
  equal(
    <div class={["a", { b: true, c: false }, [{ d: true }], "e"]}></div>,
    `<div class="a b d e"></div>`,
  ));

test("class as undefined array", () =>
  equal(<div class={[null, undefined, ""]}></div>, `<div></div>`));

test("style as string", () => equal(<h1 style="color: red"></h1>, `<h1 style="color: red"></h1>`));

test("style as empty string", () => equal(<h1 style=""></h1>, `<h1 style=""></h1>`));

test("style as object", () =>
  equal(
    <h1
      style={{
        "background-image": 'url("url")',
        "background-color": "red",
        color: "white",
        "padding-top": "1rem",
        "padding-bottom": "1rem",
      }}
    >
      Hello
    </h1>,
    `<h1 style="background-image: url(&quot;url&quot;); background-color: red; color: white; padding-top: 1rem; padding-bottom: 1rem">Hello</h1>`,
  ));

test("style as empty object", () => equal(<h1 style={{}}></h1>, `<h1></h1>`));

test("doctype declaration", () =>
  equal(
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
      </html>
    </>,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head></html>`,
  ));

test("escape enabled", () =>
  equal(
    <div>
      <h1>"Hello & World"</h1>
      {`<p>"Escaped & text"</p>`}
      {html(`<p>"Unescaped & text"</p>`)}
    </div>,
    `<div><h1>&quot;Hello &amp; World&quot;</h1>&lt;p&gt;&quot;Escaped &amp; text&quot;&lt;/p&gt;<p>"Unescaped & text"</p></div>`,
  ));

test("escape disabled", () =>
  equal(
    <div>
      <h1>{`"Hello World"`}</h1>
      <Html>
        <section>{`<p>"Unescaped & text"</p>`}</section>
      </Html>
      <h2>{`"Hello World"`}</h2>
    </div>,
    `<div><h1>&quot;Hello World&quot;</h1><section><p>"Unescaped & text"</p></section><h2>&quot;Hello World&quot;</h2></div>`,
  ));

test("escape attribute", () =>
  equal(
    <div data-props={`"><script>alert("help");</script>&amp;`}></div>,
    `<div data-props="&quot;&gt;&lt;script&gt;alert(&quot;help&quot;);&lt;/script&gt;&amp;amp;"></div>`,
  ));

test("escape json attribute", () =>
  equal(
    <h1 data-props={{ hello: "world" }}>Hello</h1>,
    `<h1 data-props="{&quot;hello&quot;:&quot;world&quot;}">Hello</h1>`,
  ));

test("escape string", () =>
  equal(
    `<h1>"Hell<span>'o'</span> &amp;& World"</h1>`,
    "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;amp;&amp; World&quot;&lt;/h1&gt;",
  ));

test("boolean value", () => equal(false, ``));

test("number value", () => equal(5, `5`));

test("zero as only child", () => equal(<h1>{0}</h1>, `<h1>0</h1>`));

test("zero with siblings", () => equal(<h1>{0} items</h1>, `<h1>0 items</h1>`));

test("empty string as only child", () => equal(<h1>{""}</h1>, `<h1></h1>`));

test("true conditional", () => equal(<>{"1" === String(1) && <div></div>}</>, `<div></div>`));

test("false conditional", () => equal(<>{"1" !== String(1) && <div></div>}</>, ``));

await test("component with children", () =>
  equal(
    <Layout>
      <section>
        <Headline />
      </section>
    </Layout>,
    "<main><section><h1>Hello World</h1></section></main>",
  ));

test("component with props and children", () =>
  equal(
    <Layout title="Hello">
      <section>
        <p>World</p>
      </section>
    </Layout>,
    "<main><h1>Hello</h1><section><p>World</p></section></main>",
  ));

test("with 'this' as context", () =>
  equal(
    <Layout context={{ subtitle: "world" }}>
      <Headline title="Hello" />
    </Layout>,
    "<main><h1>Hello - world</h1></main>",
  ));

test("async execution", async () =>
  await equal(
    <Timeout ms={1}>
      <Headline />
    </Timeout>,
    "<div><h1>Hello World</h1></div>",
  ));

// --- Edge cases: children ---

test("nested arrays as children", () =>
  equal(<ul>{[[<li>a</li>], [[<li>b</li>]], []]}</ul>, `<ul><li>a</li><li>b</li></ul>`));

test("mapped children", () =>
  equal(
    <ul>
      {[1, 2, 3].map((i) => (
        <li>{i}</li>
      ))}
    </ul>,
    `<ul><li>1</li><li>2</li><li>3</li></ul>`,
  ));

test("Set as children", () => equal(<p>{new Set(["a", <b>b</b>])}</p>, `<p>a<b>b</b></p>`));

test("iterator helper as children", () => {
  const users = new Map([
    [1, "Ada"],
    [2, "Linus"],
  ]);
  return equal(
    <ul>
      {users.values().map((name) => (
        <li>{name}</li>
      ))}
    </ul>,
    `<ul><li>Ada</li><li>Linus</li></ul>`,
  );
});

test("generator as children", () => {
  function* items() {
    yield <li>a</li>;
    yield [<li>b</li>, "c"];
  }
  return equal(<ul>{items()}</ul>, `<ul><li>a</li><li>b</li>c</ul>`);
});

test("component returning a generator", () => {
  function* Items() {
    yield <li>a</li>;
    yield Promise.resolve(<li>b</li>);
  }
  return equal(
    <ul>
      <Items />
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("iterable as top-level element", () => equal(new Set([<b>a</b>, "b"]), `<b>a</b>b`));

test("strings are not split into characters", () => equal(<p>{"abc"}</p>, `<p>abc</p>`));

test("null, undefined and boolean children are skipped", () =>
  equal(
    <p>
      {null}
      {undefined}
      {false}
      {true}a{1}
    </p>,
    `<p>a1</p>`,
  ));

test("number edge cases", () =>
  equal(
    <p>
      {-1}|{1.5}|{-0}
    </p>,
    `<p>-1|1.5|0</p>`,
  ));

test("bigint value", () => equal(10n, `10`));

test("undefined value", () => equal(undefined, ``));

test("null value", () => equal(null, ``));

test("function value", () => equal(() => "x", ``));

test("unicode text is not escaped", () => equal(<p>Grüße 🚀 ©</p>, `<p>Grüße 🚀 ©</p>`));

test("empty raw html", () => equal(<p>{html("")}</p>, `<p></p>`));

test("plain html objects are not rendered", () => {
  const body = JSON.parse(`{ "text": { "html": "<img src=x onerror=alert(1)>" } }`);
  return equal(
    <p>
      {{ html: "<b>x</b>" }}
      {body.text}
    </p>,
    `<p></p>`,
  );
});

test("copied raw html is still rendered", () => {
  /** @type {any} */
  const raw = html("<b>x</b>");
  return equal(<p>{{ ...raw }}</p>, `<p><b>x</b></p>`);
});

test("object with html and other keys is not rendered", () =>
  equal(<p>{{ html: "<script>x</script>", title: "Post" }}</p>, `<p></p>`));

test("object with inherited html key is not rendered", () =>
  equal(<p>{Object.create({ html: "<b>x</b>" })}</p>, `<p></p>`));

test("raw html with non-string value is not rendered", () =>
  equal(
    <p>
      {html(/** @type {any} */ (null))}
      {html(/** @type {any} */ (undefined))}
      {html(/** @type {any} */ (5))}
      {html(/** @type {any} */ (["<b>", "x"]))}
      {html(/** @type {any} */ ({ toString: () => "<b>x</b>" }))}
    </p>,
    `<p></p>`,
  ));

test("element look-alikes from JSON are not rendered", () => {
  const body = JSON.parse(`{
    "script": { "type": "tag", "tag": "script", "props": { "children": ["alert(1)"] } },
    "img": { "type": "tag", "tag": "img", "props": { "src": "x", "onerror": "alert(2)" } }
  }`);
  return equal(
    <p>
      {body.script}
      {body.img}
    </p>,
    `<p></p>`,
  );
});

test("JSON element look-alike as top-level element is not rendered", () =>
  equal(JSON.parse(`{ "type": "tag", "tag": "b", "props": { "children": ["x"] } }`), ``));

test("hand-built element objects are not rendered, createElement ones are", () => {
  /** @type {any} */
  const handBuilt = { type: "tag", tag: "b", props: { children: ["x"] } };
  return equal(
    <p>
      {handBuilt}
      {createElement("b", null, "y")}
    </p>,
    `<p><b>y</b></p>`,
  );
});

test("copied elements are still rendered", async () => {
  const ctx = {
    jsxToString(element) {
      // A copy with a changed tag keeps the element marker.
      const $element = element?.tag === "b" ? { ...element, tag: "i" } : element;
      return jsxToString.call(this, $element);
    },
  };
  assert.strictEqual(
    await jsxToString.call(
      ctx,
      <p>
        <b>x</b>
      </p>,
    ),
    `<p><i>x</i></p>`,
  );
});

test("children passed as prop", () => equal(<div {...{ children: "x" }} />, `<div>x</div>`));

// --- Edge cases: attributes ---

test("numeric attributes", () =>
  equal(<div tabindex={0} data-n={-1} />, `<div tabindex="0" data-n="-1"></div>`));

test("empty string attribute", () => equal(<div title="" />, `<div title=""></div>`));

test("escape single quote in attribute", () =>
  equal(<div title="it's" />, `<div title="it&#39;s"></div>`));

test("escape class array", () =>
  equal(<div class={['a"b', "<c>"]} />, `<div class="a&quot;b &lt;c&gt;"></div>`));

test("escape class object keys", () =>
  equal(<div class={{ 'a"b': true }} />, `<div class="a&quot;b"></div>`));

test("style with numeric values", () =>
  equal(
    <div style={{ "z-index": 1, opacity: 0 }} />,
    `<div style="z-index: 1; opacity: 0"></div>`,
  ));

test("style skips null, undefined and false values", () =>
  equal(
    <div
      style={{ color: null, margin: undefined, display: false, padding: 0, "font-weight": "" }}
    />,
    `<div style="padding: 0; font-weight: "></div>`,
  ));

test("style with only skipped values", () =>
  equal(<div style={{ color: null, margin: undefined, display: false }} />, `<div></div>`));

test("function and symbol attributes are skipped", () => {
  /** @type {any} */
  const props = { onclick: () => alert(1), "data-s": Symbol("s") };
  return equal(<button {...props} type="button" />, `<button type="button"></button>`);
});

test("json array attribute", () =>
  equal(<div data-x={[1, "a"]} />, `<div data-x="[1,&quot;a&quot;]"></div>`));

test("bigint in json attribute is encoded as string", () =>
  equal(
    <div data-x={{ id: 9007199254740993n, list: [1n] }} />,
    `<div data-x="{&quot;id&quot;:&quot;9007199254740993&quot;,&quot;list&quot;:[&quot;1&quot;]}"></div>`,
  ));

test("bigint attribute", () => equal(<div data-n={10n} />, `<div data-n="10"></div>`));

test("URL attribute uses its string form", () => {
  /** @type {any} */
  const url = new URL("https://x.dev/a?b=1&c=2");
  return equal(<a href={url} />, `<a href="https://x.dev/a?b=1&amp;c=2"></a>`);
});

test("Date attribute uses its string form", () => {
  /** @type {any} */
  const date = new Date(0);
  return equal(<time datetime={date} />, `<time datetime="${String(date)}"></time>`);
});

test("null-prototype object attribute is JSON-encoded", () => {
  const value = Object.assign(Object.create(null), { a: 1 });
  return equal(<div data-x={value} />, `<div data-x="{&quot;a&quot;:1}"></div>`);
});

test("invalid attribute names are skipped", () => {
  /** @type {any} */
  const props = {
    "x onclick": "1",
    'a b="c" onload': "1",
    "x/onclick": "1",
    "x\nonclick": "1",
    "x\tonclick": "1",
    'x"><script>': "1",
    "x'": "1",
    "x<": "1",
    "x&": "1",
    "x=": "1",
    "x\u0000": "1",
    "": "1",
    id: "ok",
  };
  return equal(<img {...props} />, `<img id="ok">`);
});

test("framework attribute names are kept", () => {
  /** @type {any} */
  const props = { "@click": "f()", "x-on:click": "g()", ":class": "c", "hx-get": "/" };
  return equal(
    <div {...props} />,
    `<div @click="f()" x-on:click="g()" :class="c" hx-get="/"></div>`,
  );
});

test("custom element with aria and data attributes", () =>
  equal(
    <my-element aria-label="x" data-id="1"></my-element>,
    `<my-element aria-label="x" data-id="1"></my-element>`,
  ));

test("invalid tag names are skipped", () =>
  equal(
    <p>
      {["div onmouseover=alert(1)", "div>", "x/y", "1div", "<script", "a\nb", "a\u0000"].map(
        (tag) => createElement(tag, { id: "x" }, "child"),
      )}
    </p>,
    `<p></p>`,
  ));

test("valid tag names are kept", () =>
  equal(
    <>
      <my-element />
      <my-élément />
      <foreignObject />
    </>,
    `<my-element></my-element><my-élément></my-élément><foreignObject></foreignObject>`,
  ));

// --- Edge cases: components ---

test("component returning null", () => {
  const Nothing = () => null;
  return equal(
    <p>
      <Nothing />
    </p>,
    `<p></p>`,
  );
});

test("component returning undefined", () => {
  const Undefined = () => undefined;
  return equal(<Undefined />, ``);
});

test("component returning string is escaped", () => {
  const Str = () => "<b>";
  return equal(<Str />, `&lt;b&gt;`);
});

test("component returning zero", () => {
  const Zero = () => 0;
  return equal(<Zero />, `0`);
});

test("component returning raw html", () => {
  const Raw = () => html("<b>raw</b>");
  return equal(<Raw />, `<b>raw</b>`);
});

test("nested async components", () => {
  const Inner = async ({ children }) => <b>{children}</b>;
  const Outer = async ({ children }) => <Inner>{children}</Inner>;
  return equal(<Outer>x</Outer>, `<b>x</b>`);
});

test("async siblings keep their order", () =>
  equal(
    <>
      <Timeout ms={10}>a</Timeout>
      <Timeout ms={1}>b</Timeout>
    </>,
    `<div>a</div><div>b</div>`,
  ));

test("sync component error rejects", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  return assert.rejects(async () => jsxToString.call({}, <Broken />), /boom/);
});

test("sync component error is returned as rejected promise", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  const result = jsxToString.call({}, <Broken />);
  assert.ok(result instanceof Promise);
  return assert.rejects(result, /boom/);
});

test("async component error rejects", () => {
  const Broken = async () => {
    throw new Error("boom async");
  };
  return assert.rejects(jsxToString.call({}, <Broken />), /boom async/);
});

// --- Edge cases: context ---

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

test("promise attributes are awaited", () =>
  equal(
    <div
      id="a"
      title={delay(5, "<t>")}
      class={Promise.resolve(["b", { c: true }])}
      style={Promise.resolve({ color: "red" })}
      hidden={Promise.resolve(true)}
      data-x={delay(1, { y: 1 })}
      data-none={Promise.resolve(undefined)}
    >
      x
    </div>,
    `<div id="a" title="&lt;t&gt;" class="b c" style="color: red" hidden data-x="{&quot;y&quot;:1}">x</div>`,
  ));

test("promise attribute on void tag and with thenable", () =>
  equal(
    // Built with createElement, since the attribute types only allow promises.
    classicCreateElement("img", { src: { then: (resolve) => resolve("a.png") }, alt: "" }),
    `<img src="a.png" alt="">`,
  ));

test("promise attribute waits for earlier siblings", () =>
  equal(
    <p>
      <Timeout ms={10}>a</Timeout>
      <span title={Promise.resolve("t")}>b</span>
      <span title={delay(1, "u")}>c</span>
    </p>,
    `<p><div>a</div><span title="t">b</span><span title="u">c</span></p>`,
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

test("rejected promise attribute rejects", () =>
  rejects(() => <div title={delay(5).then(() => Promise.reject(new Error("attr")))} />, "attr"));

test("promise attribute rejects while an earlier sibling is pending", () =>
  rejects(
    () => (
      <p>
        <Timeout ms={10}>a</Timeout>
        <span title={Promise.reject(new Error("early"))}>b</span>
      </p>
    ),
    "early",
  ));

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

test("escaping disabled via context", async () =>
  assert.strictEqual(
    await jsxToString.call({ jsxEscapeHTML: false }, <p>{"<b>"}</p>),
    `<p><b></p>`,
  ));

test("only an explicit false turns escaping off", async () => {
  for (const jsxEscapeHTML of [true, undefined, null, "true", "false", 1, 0, ""]) {
    assert.strictEqual(
      await jsxToString.call({ jsxEscapeHTML }, <p>{"<b>"}</p>),
      `<p>&lt;b&gt;</p>`,
      `jsxEscapeHTML: ${JSON.stringify(jsxEscapeHTML)}`,
    );
  }
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

// --- jsxToStream ---

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

test("stream of empty element closes without chunks", async () =>
  assert.deepStrictEqual(await streamToChunks(jsxToStream(<></>)), []));

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

// --- escapeEntities ---

test("escapeEntities escapes all special characters", () =>
  assert.strictEqual(escapeEntities(`<>"'&`), `&lt;&gt;&quot;&#39;&amp;`));

test("escapeEntities leaves plain text untouched", () =>
  assert.strictEqual(escapeEntities("Hello World"), "Hello World"));

test("escapeEntities with empty string", () => assert.strictEqual(escapeEntities(""), ""));

test("escapeEntities with entities at start and end", () =>
  assert.strictEqual(escapeEntities("&a<"), "&amp;a&lt;"));

// --- Regression tests ---

test("component returning array", () => {
  const Items = () => [<li>a</li>, <li>b</li>];
  return equal(
    <ul>
      <Items />
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("async component returning array", () => {
  const Items = async () => [<li>a</li>, "b", null, 0];
  return equal(<Items />, `<li>a</li>b0`);
});

test("array value", () => equal([<b>a</b>, [<i>b</i>], "<c>"], `<b>a</b><i>b</i>&lt;c&gt;`));

test("empty array value", () => equal([], ``));

test("bigint child", () => equal(<p>{10n}</p>, `<p>10</p>`));

test("array with promises", () =>
  equal([Promise.resolve(<b>a</b>), Promise.resolve("b")], `<b>a</b>b`));

// Thenables whose then() doesn't return a promise.
const thenable = (value) => ({ then: (resolve) => void resolve(value) });

test("thenable children", () =>
  equal(
    <p>
      {thenable(<b>a</b>)}
      {[thenable("b")]}
    </p>,
    `<p><b>a</b>b</p>`,
  ));

test("component returning a thenable", () => {
  /** @type {any} */
  const Thenable = () => thenable(<i>t</i>);
  return equal(<Thenable />, `<i>t</i>`);
});

test("promise children", () =>
  equal(
    <p>
      {Promise.resolve(<b>a</b>)}
      {[Promise.resolve("b")]}
    </p>,
    `<p><b>a</b>b</p>`,
  ));

test("promise as top-level element", () => equal(Promise.resolve(<p>a</p>), `<p>a</p>`));

test("thenable as top-level element", () => equal(thenable(<p>a</p>), `<p>a</p>`));

test("promise resolving to a promise", () =>
  equal(
    <p>{Promise.resolve({ then: (resolve) => resolve(Promise.resolve("a")) })}</p>,
    `<p>a</p>`,
  ));

test("rejected top-level promise", () =>
  assert.rejects(() => jsxToString.call({}, Promise.reject(new Error("boom"))), /boom/));

test("key is neither rendered as text nor as attribute", () =>
  equal(
    <ul>
      {["a", "b"].map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  ));

test("key after spread is not rendered as attribute", () => {
  const props = { id: "i" };
  return equal(<li {...props} key="k" />, `<li id="i"></li>`);
});

test("key is not passed to components", () => {
  const Props = (props) => JSON.stringify(Object.keys(props)) + props.children.length;
  return equal(<Props key="k">x</Props>, `[&quot;children&quot;]1`);
});

test("key is allowed on typed components", () => {
  // The build type-checks this: `key` must be accepted although Item's props don't declare it.
  /** @param {{ label: string }} props */
  const Item = ({ label }) => <li>{label}</li>;
  return equal(
    <ul>
      {["a", "b"].map((label) => (
        <Item key={label} label={label} />
      ))}
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("Fragment from main entry with createElement", () =>
  equal(
    classicCreateElement(Fragment, null, classicCreateElement("b", null, "a"), "b"),
    `<b>a</b>b`,
  ));

test("key with classic createElement", () =>
  equal(createElement("li", { key: "k", id: "i" }, "x"), `<li id="i">x</li>`));

test("key and source with jsxDEV", async () => {
  const Children = (props) => String(props.children.length);
  const source = { fileName: "f.jsx", lineNumber: 1, columnNumber: 1 };
  await equal(jsxDEV("li", { children: "x" }, "k", false, source, {}), `<li>x</li>`);
  await equal(jsxDEV(Children, { children: "x" }, "k", false, source, {}), `1`);
});

test("createElement does not change the passed props", async () => {
  const props = { id: "x", key: "k" };
  await equal(createElement("li", props, "a"), `<li id="x">a</li>`);
  await equal(createElement("li", props, "a"), `<li id="x">a</li>`);
  assert.deepStrictEqual(props, { id: "x", key: "k" });
});

test("createElement children replace props.children", async () => {
  await equal(createElement("p", { children: "a" }, "b"), `<p>b</p>`);
  await equal(createElement("p", { children: "a" }), `<p>a</p>`);
});

test("key after spread keeps the JSX children", () => {
  // With `key` after a spread, the compiler calls createElement instead of jsx().
  const node = { id: 1, children: ["raw"] };
  const Row = ({ children }) => <li>{children}</li>;
  return equal(
    <Row {...node} key={node.id}>
      label
    </Row>,
    `<li>label</li>`,
  );
});

const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const rejectAfter = (ms, message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

// Takes a factory, because promise children start when the JSX is created.
async function rejects(createJsx, message) {
  await assert.rejects(async () => jsxToString.call({}, createJsx()), { message });
  await assert.rejects(streamToChunks(jsxToStream.call({}, createJsx())), { message });
  // Give rejections that nobody handled the chance to fail the test.
  await delay(40);
}

test("promise child rejects while an earlier sibling is pending", () =>
  rejects(
    () => (
      <div>
        {delay(30, "a")}
        {rejectAfter(5, "boom")}
      </div>
    ),
    "boom",
  ));

test("promise child rejects after an earlier sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  return rejects(
    () => (
      <div>
        <Boom />
        {rejectAfter(5, "second")}
      </div>
    ),
    "first",
  );
});

test("nested promise child rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        <p>{rejectAfter(5, "nested")}</p>
      </div>
    ),
    "nested",
  );
});

test("component returns an array with a rejecting promise", () => {
  const List = () => [delay(30, "a"), rejectAfter(5, "array")];
  return rejects(() => <List />, "array");
});

test("component returns a nested array with a rejecting promise", () => {
  const Slow = () => delay(30, "a");
  const List = () => [<Slow />, [[rejectAfter(5, "nested array")]]];
  return rejects(() => <List />, "nested array");
});

test("component returns a nested array with a rejecting promise after a sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  const List = () => [<Boom />, [rejectAfter(5, "second")]];
  return rejects(() => <List />, "first");
});

test("promise in an array prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const Users = async ({ users }) => (await Promise.all(users)).join();
  return rejects(
    () => (
      <div>
        <Slow />
        <Users users={[delay(1, "ada"), rejectAfter(5, "array prop")]} />
      </div>
    ),
    "array prop",
  );
});

test("promise prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const User = async ({ user }) => <p>{(await user).name}</p>;
  return rejects(
    () => (
      <div>
        <Slow />
        <User user={rejectAfter(5, "prop")} />
      </div>
    ),
    "prop",
  );
});

test("promise prop rejects after an earlier sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  const User = async ({ user }) => <p>{(await user).name}</p>;
  return rejects(
    () => (
      <div>
        <Boom />
        <User user={rejectAfter(5, "second")} />
      </div>
    ),
    "first",
  );
});

test("stream waits for the reader", async () => {
  let calls = 0;
  const Item = async () => {
    calls++;
    null;
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

test("stream cancel stops a paused render", async () => {
  let calls = 0;
  const Item = async () => {
    calls++;
    null;
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

// Async iterables can be read only once, so each render gets fresh JSX from the factory.
async function equalEach(createJsx, str) {
  assert.strictEqual(await jsxToString.call({}, createJsx()), str);
  assert.strictEqual((await streamToChunks(jsxToStream.call({}, createJsx()))).join(""), str);
}

test("async generator as children", () => {
  async function* items() {
    yield <li>a</li>;
    await delay(5);
    yield "b & c";
    yield [1, <b>2</b>];
  }
  return equalEach(() => <ul>{items()}</ul>, `<ul><li>a</li>b &amp; c1<b>2</b></ul>`);
});

test("async generator component", () => {
  async function* List({ count }) {
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
  return equalEach(() => <p>{items()}</p>, `<p><i>async</i>promise</p>`);
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
  return equalEach(() => <pre>{createStream()}</pre>, `<pre>&lt;a&gt;b</pre>`);
});

test("async iterable passed directly", async () => {
  async function* items() {
    yield <b>x</b>;
  }
  assert.strictEqual(await jsxToString(items()), `<b>x</b>`);
});

test("async iterable uses the jsxToString override", () => {
  async function* items() {
    yield "a";
    yield "b";
  }
  const context = {
    jsxToString(element) {
      return typeof element === "string" ? element.toUpperCase() : jsxToString.call(this, element);
    },
  };
  return jsxToString.call(context, <p>{items()}</p>).then((result) => {
    assert.strictEqual(result, `<p>AB</p>`);
  });
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

// Renders fresh JSX (from a factory, which gets a new stream) with both renderers and
// checks that the stream was cancelled with the render error, because rendering never read it.
async function cancelsUnreadStream(createJsx, message) {
  const renders = [
    (jsx) => jsxToString.call({}, jsx),
    (jsx) => streamToChunks(jsxToStream.call({}, jsx)),
  ];
  for (const render of renders) {
    let reason;
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue("x");
        controller.close();
      },
      cancel(r) {
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
  const Layout = (_props) => {
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
  const Layout = async (_props) => {
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
  const Body = ({ body }) => body;
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
