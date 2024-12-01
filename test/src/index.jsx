import { escapeEntities, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Headline from "./components/Headline";
import Layout from "./components/Layout";
import Timeout from "./components/Timeout";

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
    `<main><div><h1>Hello World</h1></div></main>`
  ));

test("boolean attributes", () =>
  equal(
    <div
      autocapitalize
      contenteditable={true}
      spellcheck={false}
      autofocus="autofocus"
    />,
    `<div autocapitalize contenteditable autofocus="autofocus"></div>`
  ));

test("void tags", () =>
  equal(
    <>
      <hr />
      <br />
      <img src="src" alt="" />
    </>,
    `<hr><br><img src="src" alt="">`
  ));

test("empty fragment", () => equal(<></>, ``));

test("class object", () =>
  equal(
    <div
      class={{
        striped: false,
        sticky: true,
        highlight: true,
      }}
    ></div>,
    `<div class="sticky highlight"></div>`
  ));

test("empty class object", () =>
  equal(
    <div class={{ highlight: false, sticky: undefined }}></div>,
    "<div></div>"
  ));

test("style object", () =>
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
    `<h1 style="background-image: url(&quot;url&quot;); background-color: red; color: white; padding-top: 1rem; padding-bottom: 1rem">Hello</h1>`
  ));

test("doctype declaration", () =>
  equal(
    <>
      {"<!DOCTYPE html>"}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
      </html>
    </>,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head></html>`
  ));

test("boolean value", () => equal(false, ``));

test("number value", () => equal(5, `5`));

test("quote escape with json attribute", () =>
  equal(
    <h1 data-props={{ hello: "world" }}>Hello</h1>,
    `<h1 data-props="{&quot;hello&quot;:&quot;world&quot;}">Hello</h1>`
  ));

test("true conditional", () =>
  equal("1" === String(1) && <div></div>, `<div></div>`));

test("false conditional", () => equal("1" !== String(1) && <div></div>, ``));

await test("component with children", () =>
  equal(
    <Layout>
      <section>
        <Headline />
      </section>
    </Layout>,
    "<main><section><h1>Hello World</h1></section></main>"
  ));

test("component with props and children", () =>
  equal(
    <Layout title="Hello">
      <section>
        <p>World</p>
      </section>
    </Layout>,
    "<main><h1>Hello</h1><section><p>World</p></section></main>"
  ));

test("escape entities", () =>
  equal(
    escapeEntities(`<h1>"Hell<span>'o'</span> &amp;& World"</h1>`),
    "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;&amp; World&quot;&lt;/h1&gt;"
  ));

test("with 'this' as context", () =>
  equal(
    <Layout context={{ subtitle: "world" }}>
      <Headline title="Hello" />
    </Layout>,
    "<main><h1>Hello - world</h1></main>"
  ));

test("async execution", async () =>
  await equal(
    <Timeout ms={1}>
      <Headline />
    </Timeout>,
    "<div><h1>Hello World</h1></div>"
  ));
