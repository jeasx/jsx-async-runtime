import { createElement as classicCreateElement, html } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Timeout from "./components/Timeout.js";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { rejects } from "./helpers/rejects.js";

test("boolean attributes", () =>
  equal(
    <div
      hidden
      autocapitalize="off"
      contenteditable={true}
      itemscope={false}
      defer=""
      autofocus="autofocus"
    />,
    `<div hidden autocapitalize="off" contenteditable defer="" autofocus="autofocus"></div>`,
  ));

test("null or undefined attributes", () =>
  equal(<div id={null} title={undefined} />, `<div></div>`));

test("empty string attribute", () => equal(<div title="" />, `<div title=""></div>`));

test("numeric attributes", () =>
  equal(<div tabindex={0} data-n={-1} />, `<div tabindex="0" data-n="-1"></div>`));

test("elements and html() as attribute values render nothing", () =>
  equal(
    // Built with createElement, since the types don't allow these values.
    classicCreateElement("div", {
      title: <b>x</b>,
      "data-raw": html("<b>"),
      style: html("color: red"),
      class: <i />,
      "data-config": { a: 1, el: <b />, list: [<b />, 2] },
    }),
    `<div data-config="{&quot;a&quot;:1,&quot;list&quot;:[null,2]}"></div>`,
  ));

test("promise attribute resolving to an element renders nothing", () =>
  equal(classicCreateElement("div", { title: delay(1, <b>x</b>), id: "a" }), `<div id="a"></div>`));

test("bigint attribute", () => equal(<div data-n={10n} />, `<div data-n="10"></div>`));

test("URL attribute uses its string form", () => {
  const url: any = new URL("https://x.dev/a?b=1&c=2");
  return equal(<a href={url} />, `<a href="https://x.dev/a?b=1&amp;c=2"></a>`);
});

test("Date attribute uses its string form", () => {
  const date: any = new Date(0);
  return equal(<time datetime={date} />, `<time datetime="${String(date)}"></time>`);
});

test("json array attribute", () =>
  equal(<div data-x={[1, "a"]} />, `<div data-x="[1,&quot;a&quot;]"></div>`));

test("null-prototype object attribute is JSON-encoded", () => {
  const value = Object.assign(Object.create(null), { a: 1 });
  return equal(<div data-x={value} />, `<div data-x="{&quot;a&quot;:1}"></div>`);
});

test("bigint in json attribute is encoded as string", () =>
  equal(
    <div data-x={{ id: 9007199254740993n, list: [1n] }} />,
    `<div data-x="{&quot;id&quot;:&quot;9007199254740993&quot;,&quot;list&quot;:[&quot;1&quot;]}"></div>`,
  ));

test("json attribute without a JSON form renders nothing", () =>
  equal(
    <div data-x={{ toJSON: () => undefined }} data-y={{ toJSON: () => "ok" }} />,
    `<div data-y="&quot;ok&quot;"></div>`,
  ));

test("escape attribute", () =>
  equal(
    <div data-props={`"><script>alert("help");</script>&amp;`}></div>,
    `<div data-props="&quot;&gt;&lt;script&gt;alert(&quot;help&quot;);&lt;/script&gt;&amp;amp;"></div>`,
  ));

test("escape single quote in attribute", () =>
  equal(<div title="it's" />, `<div title="it&#39;s"></div>`));

test("escape json attribute", () =>
  equal(
    <h1 data-props={{ hello: "world" }}>Hello</h1>,
    `<h1 data-props="{&quot;hello&quot;:&quot;world&quot;}">Hello</h1>`,
  ));

test("function and symbol attributes are skipped", () => {
  const props: any = { onclick: () => alert(1), "data-s": Symbol("s") };
  return equal(<button {...props} type="button" />, `<button type="button"></button>`);
});

test("invalid attribute names are skipped", () => {
  const props: any = {
    "x onclick": "1",
    'a b="c" onload': "1",
    "x/onclick": "1",
    "x\nonclick": "1",
    "x\tonclick": "1",
    'x"><script>': "1",
    "x'": "1",
    "x<": "1",
    "x&": "1",
    "x=": "1",
    "x\u0000": "1",
    "": "1",
    id: "ok",
  };
  return equal(<img {...props} />, `<img id="ok">`);
});

test("framework attribute names are kept", () => {
  const props: any = { "@click": "f()", "x-on:click": "g()", ":class": "c", "hx-get": "/" };
  return equal(
    <div {...props} />,
    `<div @click="f()" x-on:click="g()" :class="c" hx-get="/"></div>`,
  );
});

test("custom element with aria and data attributes", () =>
  equal(
    <my-element aria-label="x" data-id="1"></my-element>,
    `<my-element aria-label="x" data-id="1"></my-element>`,
  ));

test("promise attributes are awaited", () =>
  equal(
    <div
      id="a"
      title={delay(5, "<t>")}
      class={Promise.resolve("b c")}
      style={Promise.resolve("color: red")}
      hidden={Promise.resolve(true)}
      data-x={delay(1, { y: 1 })}
      data-none={Promise.resolve(undefined)}
    >
      x
    </div>,
    `<div id="a" title="&lt;t&gt;" class="b c" style="color: red" hidden data-x="{&quot;y&quot;:1}">x</div>`,
  ));

test("own __proto__ attribute renders the same with promise attributes", async () => {
  // Spreading parsed JSON gives an own `__proto__` key; a promise attribute must not drop it.
  const props = JSON.parse(`{"__proto__":"x","id":"a"}`);
  await equal(<div {...props} />, `<div __proto__="x" id="a"></div>`);
  await equal(
    <div {...props} title={Promise.resolve("t")} />,
    `<div __proto__="x" id="a" title="t"></div>`,
  );
});

test("promise attribute on void tag and with thenable", () =>
  equal(
    // Built with createElement, since the attribute types only allow promises.
    classicCreateElement("img", {
      src: { then: (resolve: (value: string) => void) => resolve("a.png") },
      alt: "",
    }),
    `<img src="a.png" alt="">`,
  ));

test("promise attribute waits for earlier siblings", () =>
  equal(
    <p>
      <Timeout ms={10}>a</Timeout>
      <span title={Promise.resolve("t")}>b</span>
      <span title={delay(1, "u")}>c</span>
    </p>,
    `<p><div>a</div><span title="t">b</span><span title="u">c</span></p>`,
  ));

test("rejected promise attribute rejects", () =>
  rejects(() => <div title={delay(5).then(() => Promise.reject(new Error("attr")))} />, "attr"));

test("props that aren't rendered as attributes are not awaited", async () => {
  const never = Promise.reject(new Error("never awaited"));
  let thenCalled = false;
  const thenableFunction = Object.assign(() => {}, {
    then() {
      thenCalled = true;
    },
  });
  await equal(
    // Built with createElement, since the types don't allow these props.
    classicCreateElement("div", {
      key: never,
      "bad name": never,
      onclick: thenableFunction,
      title: delay(1, "t"),
    }),
    `<div title="t"></div>`,
  );
  assert.strictEqual(thenCalled, false);
});

test("bytes attribute renders as UTF-8 text", () =>
  equal(
    <div title={new TextEncoder().encode(`"Grüße"`) as any} />,
    `<div title="&quot;Grüße&quot;"></div>`,
  ));

test("Map, Set and class instances without toString render nothing", () => {
  class Point {
    x = 1;
  }
  return equal(
    <div
      data-a={new Map([[1, 2]])}
      data-b={new Set([1])}
      data-c={new Point()}
      data-d={Object.create(Object.create(null))}
      id="x"
    />,
    `<div id="x"></div>`,
  );
});

