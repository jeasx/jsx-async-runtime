import { jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Headline from "./components/Headline";
import Layout from "./components/Layout";
import Timeout from "./components/Timeout";
import Unescaped from "./components/Unescaped";

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
      hidden
      autocapitalize="off"
      contenteditable={true}
      spellcheck={false}
      defer=""
      autofocus="autofocus"
    />,
    `<div hidden autocapitalize="off" contenteditable defer="" autofocus="autofocus"></div>`
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
    `<hr><br><img src="src" alt=""><link href="/"><input type="text">`
  ));

test("empty fragment", () => equal(<></>, ``));

test("class as string", () =>
  equal(<div class="a b c"></div>, `<div class="a b c"></div>`));

test("class as empty string", () =>
  equal(<div class=""></div>, `<div class=""></div>`));

test("class as object", () => {
  const className1 = "";
  const className2 = "hidden";
  const className3 = undefined;
  equal(
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
    `<div class="sticky highlight hidden"></div>`
  );
});

test("class as empty object", () =>
  equal(
    <div class={{ highlight: false, sticky: undefined }}></div>,
    "<div></div>"
  ));

test("class as array", () =>
  equal(
    <div class={["a", "b", undefined, "c", null, ""]}></div>,
    `<div class="a b c"></div>`
  ));

test("class as empty array", () =>
  equal(<div class={[]}></div>, `<div></div>`));

test("class as undefined array", () =>
  equal(<div class={[null, undefined, ""]}></div>, `<div></div>`));

test("style as string", () =>
  equal(<h1 style="color: red"></h1>, `<h1 style="color: red"></h1>`));

test("style as empty string", () =>
  equal(<h1 style=""></h1>, `<h1 style=""></h1>`));

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
    `<h1 style="background-image: url(&quot;url&quot;); background-color: red; color: white; padding-top: 1rem; padding-bottom: 1rem">Hello</h1>`
  ));

test("doctype declaration", () =>
  equal(
    <>
      {{ __html: "<!DOCTYPE html>" }}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
      </html>
    </>,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head></html>`
  ));

test("escape enabled", () =>
  equal(
    <div>
      <h1>"Hello & World"</h1>
      {`<p>"Escaped & text"</p>`}
      {{ __html: `<p>"Unescaped & text"</p>` }}
    </div>,
    `<div><h1>&quot;Hello &amp; World&quot;</h1>&lt;p&gt;&quot;Escaped &amp; text&quot;&lt;/p&gt;<p>"Unescaped & text"</p></div>`
  ));

test("escape disbaled", () =>
  equal(
    <div>
      <h1>{`"Hello World"`}</h1>
      <Unescaped>
        <section>{`<p>"Unescaped & text"</p>`}</section>
      </Unescaped>
      <h2>{`"Hello World"`}</h2>
    </div>,
    `<div><h1>&quot;Hello World&quot;</h1><section><p>"Unescaped & text"</p></section><h2>&quot;Hello World&quot;</h2></div>`
  ));

test("escape attribute", () =>
  equal(
    <div data-props={`\"><script>alert("help");</script>&amp;`}></div>,
    `<div data-props="&quot;&gt;&lt;script&gt;alert(&quot;help&quot;);&lt;/script&gt;&amp;amp;"></div>`
  ));

test("escape json attribute", () =>
  equal(
    <h1 data-props={{ hello: "world" }}>Hello</h1>,
    `<h1 data-props="{&quot;hello&quot;:&quot;world&quot;}">Hello</h1>`
  ));

test("escape string", () =>
  equal(
    `<h1>"Hell<span>'o'</span> &amp;& World"</h1>`,
    "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;amp;&amp; World&quot;&lt;/h1&gt;"
  ));

test("boolean value", () => equal(false, ``));

test("number value", () => equal(5, `5`));

test("true conditional", () =>
  equal(<>{"1" === String(1) && <div></div>}</>, `<div></div>`));

test("false conditional", () =>
  equal(<>{"1" !== String(1) && <div></div>}</>, ``));

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
