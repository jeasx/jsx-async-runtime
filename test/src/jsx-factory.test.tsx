import { createElement as classicCreateElement, Fragment } from "jsx-async-runtime";
import { jsxDEV } from "jsx-async-runtime/jsx-dev-runtime";
import { createElement, jsx } from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import { equal } from "./helpers/equal.js";

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

test("key after spread keeps the JSX children", () => {
  // With `key` after a spread, the compiler calls createElement instead of jsx().
  const node = { id: 1, children: ["raw"] };
  const Row = ({ children }: { children: JSX.Children }) => <li>{children}</li>;
  return equal(
    <Row {...node} key={node.id}>
      label
    </Row>,
    `<li>label</li>`,
  );
});

test("key is not passed to components", () => {
  const Props = (props: Record<string, unknown>) => JSON.stringify(props);
  return equal(<Props key="k">x</Props>, `{&quot;children&quot;:&quot;x&quot;}`);
});

test("key is not passed to components, however the element was created", async () => {
  const Props = (props: Record<string, unknown>) => JSON.stringify(props);
  const node = { id: "i", key: "k" };
  const expected = `{&quot;id&quot;:&quot;i&quot;}`;
  // With `key` after a spread, the compiler calls createElement instead of jsx().
  await equal(<Props {...node} key="k2" />, expected);
  // A spread `key` ends up in the props passed to jsx().
  await equal(<Props {...node} />, expected);
  await equal(createElement(Props, node), expected);
  await equal(jsx(Props, node), expected);
  assert.deepStrictEqual(node, { id: "i", key: "k" });
});

test("key is allowed on typed components", () => {
  // The build type-checks this: `key` must be accepted although Item's props don't declare it.
  const Item = ({ label }: { label: string }) => <li>{label}</li>;
  return equal(
    <ul>
      {["a", "b"].map((label) => (
        <Item key={label} label={label} />
      ))}
    </ul>,
    `<ul><li>a</li><li>b</li></ul>`,
  );
});

test("key with classic createElement", () =>
  equal(createElement("li", { key: "k", id: "i" }, "x"), `<li id="i">x</li>`));

test("key and source with jsxDEV", async () => {
  const Props = (props: Record<string, unknown>) => JSON.stringify(props);
  const source = { fileName: "f.jsx", lineNumber: 1, columnNumber: 1 };
  await equal(jsxDEV("li", { children: "x" }, "k", false, source, {}), `<li>x</li>`);
  await equal(
    jsxDEV(Props, { children: "x" }, "k", false, source, {}),
    `{&quot;children&quot;:&quot;x&quot;}`,
  );
});

test("Fragment from main entry with createElement", () =>
  equal(
    classicCreateElement(Fragment, null, classicCreateElement("b", null, "a"), "b"),
    `<b>a</b>b`,
  ));

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

test("children passed as prop", () => equal(<div {...{ children: "x" }} />, `<div>x</div>`));
