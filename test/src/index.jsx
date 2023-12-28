import { escapeEntities, renderToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";

assert.strictEqual(
  await renderToString(
    <div>
      <h1>Hello World</h1>
    </div>,
  ),
  `<div>\n<h1>Hello World</h1>\n</div>`,
  "default indent",
);

assert.strictEqual(
  await renderToString(
    <main>
      <div>
        <h1>Hello World</h1>
      </div>
    </main>,
    { indent: 2 },
  ),
  `<main>\n  <div>\n    <h1>Hello World</h1>\n  </div>\n</main>`,
  "indent 2",
);

assert.strictEqual(
  await renderToString(
    <div
      autocapitalize
      contenteditable={true}
      spellcheck={false}
      autofocus="autofocus"
    />,
  ),
  `<div autocapitalize contenteditable autofocus="autofocus"></div>`,
  "boolean attributes",
);

assert.strictEqual(
  await renderToString(
    <>
      <hr />
      <br />
    </>,
  ),
  `<hr>\n<br>`,
  "void tags",
);

assert.strictEqual(await renderToString(<></>), ``, "empty fragment");

assert.strictEqual(
  await renderToString(
    <div
      class={{
        striped: false,
        sticky: true,
        highlight: true,
      }}
    ></div>,
  ),
  `<div class="sticky highlight"></div>`,
  "class object",
);

assert.strictEqual(
  await renderToString(
    <h1
      style={{
        "background-image": 'url("https://picsum.photos/1200/200")',
        "background-color": "red",
        color: "white",
        "padding-top": "1rem",
        "padding-bottom": "1rem",
      }}
    >
      Hello
    </h1>,
  ),
  `<h1 style="background-image: url(&quot;https://picsum.photos/1200/200&quot;); background-color: red; color: white; padding-top: 1rem; padding-bottom: 1rem">Hello</h1>`,
  "style object",
);

assert.strictEqual(
  await renderToString(
    <>
      {"<!DOCTYPE html>"}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
      </html>
    </>,
  ),
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n</head>\n</html>`,
  "doctype declaration",
);

assert.strictEqual(await renderToString(false), ``, "boolean value");

assert.strictEqual(await renderToString(5), `5`, "number value");

assert.strictEqual(
  await renderToString(true && <div></div>),
  `<div></div>`,
  "true conditional",
);

assert.strictEqual(
  await renderToString(false && <div></div>),
  ``,
  "false conditional",
);

const Layout = ({ title = "", children = {} }) => (
  <main>
    {title && <h1>{title}</h1>}
    {children}
  </main>
);

assert.strictEqual(
  await renderToString(
    <Layout title="Hello">
      <section>
        <p>World</p>
      </section>
    </Layout>,
    { indent: 0 },
  ),
  "<main>\n<h1>Hello</h1>\n<section>\n<p>World</p>\n</section>\n</main>",
  "component with props and children",
);

assert.strictEqual(
  await renderToString(
    <Layout>
      <section>
        <p>Hello World</p>
      </section>
    </Layout>,
  ),
  "<main>\n<section>\n<p>Hello World</p>\n</section>\n</main>",
  "component with children",
);

assert.strictEqual(
  escapeEntities(`<h1>"Hell<span>'o'</span> && World"</h1>`),
  "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;&amp; World&quot;&lt;/h1&gt;",
  "escape entities",
);
