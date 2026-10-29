import { html } from "jsx-async-runtime";
import test from "node:test";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { rejectAfter } from "./helpers/reject-after.js";

test("class as string", () => equal(<div class="a b c"></div>, `<div class="a b c"></div>`));

test("class as empty string", () => equal(<div class=""></div>, `<div class=""></div>`));

test("class as object", () => {
  const className1 = "";
  const className2 = "hidden";
  // An undefined key becomes "undefined", which is skipped like any other false condition.
  const className3: any = undefined;
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
  const isActive: any = true;
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

test("class array skips elements and html()", () =>
  equal(
    <div class={["a", html("<b>"), [<i />], { c: true }] as any} />,
    `<div class="a c"></div>`,
  ));

test("class skips promise names and conditions", () =>
  equal(
    <div
      class={["a", Promise.resolve("b"), [Promise.resolve("c")], { d: Promise.resolve(true), e: true }] as any}
    />,
    `<div class="a e"></div>`,
  ));

test("class object skips promise conditions, even if they reject", () =>
  equal(
    () => <div class={{ a: true, b: rejectAfter(1, "class") as any }} />,
    `<div class="a"></div>`,
  ));

test("class skips rejecting promises nested in objects", async () => {
  await equal(
    () => <div class={[{ a: true, b: rejectAfter(1, "nested class") as any }]} />,
    `<div class="a"></div>`,
  );
  // Give a rejection that nobody handled the chance to fail the test.
  await delay(10);
});

test("whole class value as promise is still awaited", () =>
  equal(<div class={Promise.resolve({ a: true, b: false }) as any} />, `<div class="a"></div>`));

test("style skips promise values, even if they reject", async () => {
  await equal(
    () => <div style={{ color: Promise.resolve("red") as any, margin: rejectAfter(1, "style") as any, padding: 0 }} />,
    `<div style="padding: 0"></div>`,
  );
  await delay(10);
});

test("style from a promise skips nested promise values", async () => {
  await equal(
    () => <div style={Promise.resolve({ color: rejectAfter(1, "late style"), padding: 0 }) as any} />,
    `<div style="padding: 0"></div>`,
  );
  await delay(10);
});

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

test("style skips elements and html() values", () =>
  equal(
    <div style={{ color: html("red") as any, margin: (<b />) as any, padding: 0 }} />,
    `<div style="padding: 0"></div>`,
  ));

test("style skips functions and Symbols instead of throwing or rendering source", () =>
  equal(
    <div style={{ color: (() => "red") as any, margin: Symbol("x") as any, padding: 0 }} />,
    `<div style="padding: 0"></div>`,
  ));

test("style skips plain objects and arrays, but renders objects with their own toString", () =>
  equal(
    <div
      style={{
        color: { a: 1 } as any,
        margin: ["1px", "2px"] as any,
        "background-image": new URL("https://example.com/a.png") as any,
      }}
    />,
    `<div style="background-image: https://example.com/a.png"></div>`,
  ));

test("class skips functions and Symbols", () =>
  equal(
    <div class={["a", (() => "b") as any, Symbol("c") as any, ["d", Symbol("e") as any]]} />,
    `<div class="a d"></div>`,
  ));
