import { escapeEntities, jsxToString } from "jsx-async-runtime";
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
      {{ html: "<!DOCTYPE html>" }}
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
      {{ html: `<p>"Unescaped & text"</p>` }}
    </div>,
    `<div><h1>&quot;Hello &amp; World&quot;</h1>&lt;p&gt;&quot;Escaped &amp; text&quot;&lt;/p&gt;<p>"Unescaped & text"</p></div>`,
  ));

test("escape disbaled", () =>
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

test("empty html object", () => equal(<p>{{ html: "" }}</p>, `<p></p>`));

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

test("json array attribute", () =>
  equal(<div data-x={[1, "a"]} />, `<div data-x="[1,&quot;a&quot;]"></div>`));

test("custom element with aria and data attributes", () =>
  equal(
    <my-element aria-label="x" data-id="1"></my-element>,
    `<my-element aria-label="x" data-id="1"></my-element>`,
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

test("component returning html object", () => {
  const Raw = () => ({ html: "<b>raw</b>" });
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

test("async component error rejects", () => {
  const Broken = async () => {
    throw new Error("boom async");
  };
  return assert.rejects(jsxToString.call({}, <Broken />), /boom async/);
});

// --- Edge cases: context ---

test("render without 'this' context", async () =>
  assert.strictEqual(await jsxToString(<p>{"<b>"}</p>), `<p>&lt;b&gt;</p>`));

test("escaping disabled via context", async () =>
  assert.strictEqual(
    await jsxToString.call({ jsxEscapeHTML: false }, <p>{"<b>"}</p>),
    `<p><b></p>`,
  ));

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

test("key with classic createElement", () =>
  equal(createElement("li", { key: "k", id: "i" }, "x"), `<li id="i">x</li>`));

test("key and source with jsxDEV", async () => {
  const Children = (props) => String(props.children.length);
  const source = { fileName: "f.jsx", lineNumber: 1, columnNumber: 1 };
  await equal(jsxDEV("li", { children: "x" }, "k", false, source, {}), `<li>x</li>`);
  await equal(jsxDEV(Children, { children: "x" }, "k", false, source, {}), `1`);
});
