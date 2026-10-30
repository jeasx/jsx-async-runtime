import test from "node:test";
import { equal } from "./helpers/equal.js";

// `class` and `style` are plain attributes: strings render as is, and objects and arrays
// follow the same rules as in every other attribute.

test("class as string", () => equal(<div class="a b c"></div>, `<div class="a b c"></div>`));

test("class as empty string", () => equal(<div class=""></div>, `<div class=""></div>`));

test("style as string", () => equal(<h1 style="color: red"></h1>, `<h1 style="color: red"></h1>`));

test("style as empty string", () => equal(<h1 style=""></h1>, `<h1 style=""></h1>`));

test("escape class and style strings", () =>
  equal(
    <div class={'a"b <c>'} style={'content: "<x>"'} />,
    `<div class="a&quot;b &lt;c&gt;" style="content: &quot;&lt;x&gt;&quot;"></div>`,
  ));

test("class and style skip null, undefined and false", () =>
  equal(
    <>
      <div class={null} style={undefined} />
      <div class={false as any} style={false as any} />
    </>,
    `<div></div><div></div>`,
  ));

test("class and style objects and arrays render as JSON, like other attributes", () =>
  equal(
    <div class={{ a: true } as any} style={["color: red"] as any} />,
    `<div class="{&quot;a&quot;:true}" style="[&quot;color: red&quot;]"></div>`,
  ));

test("class and style from a userland helper", () => {
  const cx = (...names: unknown[]) => names.filter(Boolean).join(" ");
  const css = (styles: Record<string, string | number | null>) =>
    Object.entries(styles)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  return equal(
    <div class={cx("a", false && "b", "c")} style={css({ color: "red", margin: null })} />,
    `<div class="a c" style="color: red"></div>`,
  );
});

test("class and style as promises are awaited", () =>
  equal(
    <div class={Promise.resolve("a b")} style={Promise.resolve("color: red")} />,
    `<div class="a b" style="color: red"></div>`,
  ));
