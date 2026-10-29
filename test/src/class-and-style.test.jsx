import test from "node:test";
import { equal } from "./helpers/equal.js";

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

test("class array skips true, like falsy values", () => {
  // e.g. `isActive || "inactive"`, which the types reject, but plain JS allows.
  /** @type {any} */
  const isActive = true;
  return equal(
    <div class={["a", isActive || "inactive", [true], 0, 1]}></div>,
    `<div class="a 1"></div>`,
  );
});

test("class as undefined array", () =>
  equal(<div class={[null, undefined, ""]}></div>, `<div></div>`));

test("escape class array", () =>
  equal(<div class={['a"b', "<c>"]} />, `<div class="a&quot;b &lt;c&gt;"></div>`));

test("escape class object keys", () =>
  equal(<div class={{ 'a"b': true }} />, `<div class="a&quot;b"></div>`));

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

test("style with numeric values", () =>
  equal(
    <div style={{ "z-index": 1, opacity: 0 }} />,
    `<div style="z-index: 1; opacity: 0"></div>`,
  ));

test("style skips null, undefined, false and empty string values", () =>
  equal(
    <div
      style={{ color: null, margin: undefined, display: false, padding: 0, "font-weight": "" }}
    />,
    `<div style="padding: 0"></div>`,
  ));

test("style with only skipped values", () =>
  equal(
    <div style={{ color: null, margin: undefined, display: false, "font-weight": "" }} />,
    `<div></div>`,
  ));
