import { escapeEntities, html, jsxToString } from "jsx-async-runtime";
import { createElement } from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
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

test("removed jsxEscapeHTML context option doesn't turn escaping off", () =>
  assert.strictEqual(
    jsxToString.call({ jsxEscapeHTML: false }, <p>{"<b>"}</p>),
    `<p>&lt;b&gt;</p>`,
  ));

test("jsxToString override renders text raw", async () => {
  // Migration path for the removed `jsxEscapeHTML: false` (see CHANGELOG).
  // Bytes reach the override as text, so checking for strings covers them too.
  const context = {
    jsxToString(element: JSX.Element) {
      if (typeof element === "string") return element;
      return jsxToString.call(this, element);
    },
  };
  const Text = () => <i>{"<b>2</b>"}</i>;
  async function* chunks() {
    yield "<b>4</b>";
    yield new TextEncoder().encode("<b>5</b>");
  }
  assert.strictEqual(
    await jsxToString.call(
      context,
      <p title="<q>">
        {"<b>1</b>"}
        <Text />
        {Buffer.from("<b>3</b>")}
        {chunks()}
      </p>,
    ),
    `<p title="&lt;q&gt;"><b>1</b><i><b>2</b></i><b>3</b><b>4</b><b>5</b></p>`,
  );
});

test("escapeEntities escapes all special characters", () =>
  assert.strictEqual(escapeEntities(`<>"'&`), `&lt;&gt;&quot;&#39;&amp;`));

test("escapeEntities leaves plain text untouched", () =>
  assert.strictEqual(escapeEntities("Hello World"), "Hello World"));

test("escapeEntities with empty string", () => assert.strictEqual(escapeEntities(""), ""));

test("escapeEntities with entities at start and end", () =>
  assert.strictEqual(escapeEntities("&a<"), "&amp;a&lt;"));

test("escapeEntities converts other values to a string", () => {
  assert.strictEqual(
    escapeEntities(new URL("https://example.com/?a=1&b=2")),
    "https://example.com/?a=1&amp;b=2",
  );
  assert.strictEqual(escapeEntities(5), "5");
  assert.strictEqual(escapeEntities(0), "0");
  assert.strictEqual(escapeEntities(10n), "10");
});

test("escapeEntities with null, undefined and booleans", () => {
  assert.strictEqual(escapeEntities(null), "");
  assert.strictEqual(escapeEntities(undefined), "");
  assert.strictEqual(escapeEntities(false), "");
  assert.strictEqual(escapeEntities(true), "");
});

test("escapeEntities with functions and Symbols", () => {
  // Nothing, like as children or attributes, instead of the function's source code.
  assert.strictEqual(
    escapeEntities(() => "<b>secret</b>"),
    "",
  );
  assert.strictEqual(escapeEntities(class User {}), "");
  assert.strictEqual(escapeEntities(Symbol("<s>")), "");
});

test("escapeEntities with objects without their own string form", () => {
  // Nothing instead of "[object Object]". Unlike a `Map` child, which renders its entries,
  // a `Map` has no string form of its own.
  assert.strictEqual(escapeEntities({}), "");
  assert.strictEqual(escapeEntities({ name: "<b>" }), "");
  assert.strictEqual(escapeEntities(new Map([["a", 1]])), "");
  assert.strictEqual(escapeEntities(new (class User {})()), "");
  // Has no `toString` at all, which made String() throw.
  assert.strictEqual(escapeEntities(Object.create(null)), "");
  // Objects with their own string form still render it.
  assert.strictEqual(
    escapeEntities(
      new (class {
        toString = () => "<u>";
      })(),
    ),
    "&lt;u&gt;",
  );
});

test("escapeEntities with arrays gives the same text as children", () => {
  // Joined without commas and with `null` and booleans skipped, like `{["<a>", "b"]}`.
  assert.strictEqual(escapeEntities(["<a>", "b"]), "&lt;a&gt;b");
  assert.strictEqual(escapeEntities(["a", null, false, true, undefined, 0, ["b", ["c"]]]), "a0bc");
  assert.strictEqual(escapeEntities([]), "");
  // Elements have no text form, like on their own.
  assert.strictEqual(escapeEntities(["a", <b>x</b>, html("<i>"), "c"]), "ac");
  // Other iterables keep their own string form, e.g. for building a URL.
  assert.strictEqual(escapeEntities(new URLSearchParams("a=1&b=2")), "a=1&amp;b=2");
});

test("escapeEntities with bytes gives their UTF-8 text, like children", () => {
  const encoder = new TextEncoder();
  assert.strictEqual(escapeEntities(encoder.encode("<ä>")), "&lt;ä&gt;");
  assert.strictEqual(escapeEntities(Buffer.from("<ä>")), "&lt;ä&gt;");
  // A character split between two chunks is decoded as one.
  const bytes = encoder.encode("<ä>");
  assert.strictEqual(escapeEntities([bytes.subarray(0, 2), bytes.subarray(2)]), "&lt;ä&gt;");
  assert.strictEqual(escapeEntities(["a", encoder.encode("b"), "c"]), "abc");
});

test("escapeEntities on a non-string renders escaped inside raw html", () =>
  equal(<p>{html(escapeEntities(new Error("<b>")))}</p>, "<p>Error: &lt;b&gt;</p>"));

test("component returning raw html", () => {
  const Raw = () => html("<b>raw</b>");
  return equal(<Raw />, `<b>raw</b>`);
});

test("empty raw html", () => equal(<p>{html("")}</p>, `<p></p>`));

test("raw html with non-string value is not rendered", () =>
  equal(
    <p>
      {html(null as any)}
      {html(undefined as any)}
      {html(5 as any)}
      {html(["<b>", "x"] as any)}
      {html({ toString: () => "<b>x</b>" } as any)}
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
  const raw: any = html("<b>x</b>");
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
  const handBuilt: any = { type: "tag", tag: "b", props: { children: ["x"] } };
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
    jsxToString(element: any) {
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

test("a polluted Object.prototype adds no children", async () => {
  // E.g. from a request body like `{"__proto__": {"children": "pwned"}}`.
  (Object.prototype as any).children = "pwned";
  try {
    await equal(
      <div>
        <p />
        <br />
        <></>
      </div>,
      `<div><p></p><br></div>`,
    );
  } finally {
    delete (Object.prototype as any).children;
  }
});

test("a polluted Object.prototype adds no attributes and no raw markup", async () => {
  // Simulates a prototype pollution bug elsewhere in the app, e.g. a naive deep merge
  // of a request body like `{"__proto__": {"onmouseover": "alert(1)"}}`.
  const polluted = {
    onmouseover: "alert(1)",
    html: "<img src=x onerror=alert(1)>",
    background: "url(https://evil.example)",
  };
  Object.assign(Object.prototype, polluted);
  try {
    await equal(
      <div class={{ a: true }} style={{ color: "red" }}>
        <p title={Promise.resolve("t")}>text</p>
        {html("<b>raw</b>")}
      </div>,
      `<div class="a" style="color: red"><p title="t">text</p><b>raw</b></div>`,
    );
  } finally {
    for (const key in polluted) {
      delete (Object.prototype as any)[key];
    }
  }
});

test("a polluted Object.prototype.jsxToString doesn't break rendering", async () => {
  // E.g. from a request body like `{"__proto__": {"jsxToString": "x"}}`.
  // The default context `{}` inherits it, but only a function counts as an override.
  (Object.prototype as any).jsxToString = "x";
  try {
    await equal(
      <div>
        <p>text</p>
      </div>,
      `<div><p>text</p></div>`,
    );
  } finally {
    delete (Object.prototype as any).jsxToString;
  }
});

test("a polluted Object.prototype.waits doesn't break async rendering", async () => {
  // E.g. from a request body like `{"__proto__": {"waits": {}}}`.
  (Object.prototype as any).waits = {};
  try {
    await equal(
      <div>
        <p>{Promise.resolve("text")}</p>
      </div>,
      `<div><p>text</p></div>`,
    );
  } finally {
    delete (Object.prototype as any).waits;
  }
});

test("a polluted Object.prototype isn't walked in object props", async () => {
  // E.g. from a request body like `{"__proto__": {"tracked": ...}}`. Object props are checked
  // for early promise rejections, which must skip inherited keys like the rest of the runtime.
  let reads = 0;
  Object.defineProperty(Object.prototype, "tracked", {
    enumerable: true,
    configurable: true,
    get() {
      reads++;
      return undefined;
    },
  });
  try {
    await equal(
      <div data-user={{ name: "a" }} />,
      `<div data-user="{&quot;name&quot;:&quot;a&quot;}"></div>`,
    );
    assert.strictEqual(reads, 0);
  } finally {
    delete (Object.prototype as any).tracked;
  }
});
