import { createElement, html, isJsxNode, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";

test("isJsxNode is true for elements, fragments, html() markup and their copies", () => {
  const Component = () => <p>x</p>;
  const element: any = <p>x</p>;
  const nodes = [
    <p>x</p>,
    <Component />,
    <>x</>,
    createElement("p", null, "x"),
    html("<b>x</b>"),
    { ...element, tag: "i" },
  ];
  for (const node of nodes) {
    assert.strictEqual(isJsxNode(node), true);
  }
});

test("isJsxNode is false for look-alikes and other values", () => {
  // e.g. a route that returns JSON data shaped like an element
  const lookAlikes = JSON.parse(`[
    { "type": "tag", "tag": "p", "props": { "children": "x" } },
    { "type": "html", "html": "<b>x</b>" }
  ]`);
  const values = [
    ...lookAlikes,
    {},
    null,
    undefined,
    "<p>x</p>",
    0,
    [<p>x</p>],
    Promise.resolve(<p>x</p>),
    () => <p>x</p>,
  ];
  for (const value of values) {
    assert.strictEqual(isJsxNode(value), false);
  }
});

test("isJsxNode lets a typed override read the tag", () => {
  // The build type-checks `element.tag` after the guard, without a cast to `any`.
  const context = {
    jsxToString(this: unknown, element: JSX.Element) {
      if (isJsxNode(element) && element.tag === "script") {
        return "";
      }
      return jsxToString.call(this, element);
    },
  };
  return assert.strictEqual(
    jsxToString.call(
      context,
      <div>
        <script>alert(1)</script>
        {html("<b>raw</b>")}
        <p>text</p>
      </div>,
    ),
    `<div><b>raw</b><p>text</p></div>`,
  );
});

test("isJsxNode decides whether a result is rendered, e.g. a route response", async () => {
  // Rendered: elements and html() markup. Sent as is: everything else, e.g. JSON data.
  const respond = (result: unknown) => (isJsxNode(result) ? jsxToString(result) : result);
  const data = JSON.parse(`{ "type": "tag", "props": {} }`);
  assert.strictEqual(await respond(<p>x</p>), `<p>x</p>`);
  assert.strictEqual(await respond(html("<!DOCTYPE html>")), `<!DOCTYPE html>`);
  assert.strictEqual(await respond(data), data);
});
