import { escapeEntities, html, jsxToString } from "jsx-async-runtime";
import { createElement } from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Html from "./components/Html.js";
import { equal } from "./helpers/equal.js";

test("escape enabled", () =>
  equal(
    <div>
      <h1>"Hello & World"</h1>
      {`<p>"Escaped & text"</p>`}
      {html(`<p>"Unescaped & text"</p>`)}
    </div>,
    `<div><h1>&quot;Hello &amp; World&quot;</h1>&lt;p&gt;&quot;Escaped &amp; text&quot;&lt;/p&gt;<p>"Unescaped & text"</p></div>`,
  ));

test("escape string", () =>
  equal(
    `<h1>"Hell<span>'o'</span> &amp;& World"</h1>`,
    "&lt;h1&gt;&quot;Hell&lt;span&gt;&#39;o&#39;&lt;/span&gt; &amp;amp;&amp; World&quot;&lt;/h1&gt;",
  ));

test("unicode text is not escaped", () => equal(<p>Grüße 🚀 ©</p>, `<p>Grüße 🚀 ©</p>`));

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

test("escapeEntities escapes all special characters", () =>
  assert.strictEqual(escapeEntities(`<>"'&`), `&lt;&gt;&quot;&#39;&amp;`));

test("escapeEntities leaves plain text untouched", () =>
  assert.strictEqual(escapeEntities("Hello World"), "Hello World"));

test("escapeEntities with empty string", () => assert.strictEqual(escapeEntities(""), ""));

test("escapeEntities with entities at start and end", () =>
  assert.strictEqual(escapeEntities("&a<"), "&amp;a&lt;"));

test("component returning raw html", () => {
  const Raw = () => html("<b>raw</b>");
  return equal(<Raw />, `<b>raw</b>`);
});

test("empty raw html", () => equal(<p>{html("")}</p>, `<p></p>`));

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

test("object with html and other keys is not rendered", () =>
  equal(<p>{{ html: "<script>x</script>", title: "Post" }}</p>, `<p></p>`));

test("object with inherited html key is not rendered", () =>
  equal(<p>{Object.create({ html: "<b>x</b>" })}</p>, `<p></p>`));

test("copied raw html is still rendered", () => {
  /** @type {any} */
  const raw = html("<b>x</b>");
  return equal(<p>{{ ...raw }}</p>, `<p><b>x</b></p>`);
});

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
