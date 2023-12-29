import { escapeEntities } from "jsx-async-runtime";
import Layout from "./components/Layout";
import test from "./utils/test";

await test(
  "default indent",
  <div>
    <h1>Hello World</h1>
  </div>,
  `<div>\n<h1>Hello World</h1>\n</div>`,
);

await test(
  "indent = 2",
  <main>
    <div>
      <h1>Hello World</h1>
    </div>
  </main>,
  `<main>\n  <div>\n    <h1>Hello World</h1>\n  </div>\n</main>`,
  { indent: 2 },
);

await test(
  "boolean attributes",
  <div
    autocapitalize
    contenteditable={true}
    spellcheck={false}
    autofocus="autofocus"
  />,
  `<div autocapitalize contenteditable autofocus="autofocus"></div>`,
);

await test(
  "void tags",
  <>
    <hr />
    <br />
    <img
      src="https://picsum.photos/1200/200"
      alt=""
    />
  </>,
  `<hr>\n<br>\n<img src="https://picsum.photos/1200/200" alt="">`,
);

await test("empty fragment", <></>, ``);

await test(
  "class object",
  <div
    class={{
      striped: false,
      sticky: true,
      highlight: true,
    }}
  ></div>,
  `<div class="sticky highlight"></div>`,
);

await test(
  "style object",
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
  `<h1 style="background-image: url(&quot;https://picsum.photos/1200/200&quot;); background-color: red; color: white; padding-top: 1rem; padding-bottom: 1rem">Hello</h1>`,
);

await test(
  "doctype declaration",
  <>
    {"<!DOCTYPE html>"}
    <html lang="en">
      <head>
        <meta charset="utf-8" />
      </head>
    </html>
  </>,
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n</head>\n</html>`,
);

await test("boolean value", false, ``);

await test("number value", 5, `5`);

await test(
  "quote escape with json attribute",
  <h1 data-props={{ hello: "world" }}>Hello</h1>,
  `<h1 data-props="{&quot;hello&quot;:&quot;world&quot;}">Hello</h1>`,
);

await test("true conditional", true && <div></div>, `<div></div>`);

await test("false conditional", false && <div></div>, ``);

await test(
  "component with children",
  <Layout>
    <section>
      <p>Hello World</p>
    </section>
  </Layout>,
  "<main>\n<section>\n<p>Hello World</p>\n</section>\n</main>",
);

await test(
  "component with props and children",
  <Layout title="Hello">
    <section>
      <p>World</p>
    </section>
  </Layout>,
  "<main>\n<h1>Hello</h1>\n<section>\n<p>World</p>\n</section>\n</main>",
);

await test(
  "escape entities",
  escapeEntities(`<h1>"Hell<span>'o'</span> && World"</h1>`),
  "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;&amp; World&quot;&lt;/h1&gt;",
);
