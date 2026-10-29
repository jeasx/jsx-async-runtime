import { createElement as classicCreateElement, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Headline from "./components/Headline.js";
import Layout from "./components/Layout.js";
import Timeout from "./components/Timeout.js";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";

test("component with children", () =>
  equal(
    <Layout>
      <section>
        <Headline />
      </section>
    </Layout>,
    "<main><section><h1>Hello World</h1></section></main>",
  ));

test("component with props and children", () =>
  equal(
    <Layout title="Hello">
      <section>
        <p>World</p>
      </section>
    </Layout>,
    "<main><h1>Hello</h1><section><p>World</p></section></main>",
  ));

test("with 'this' as context", () =>
  equal(
    <Layout context={{ subtitle: "world" }}>
      <Headline title="Hello" />
    </Layout>,
    "<main><h1>Hello - world</h1></main>",
  ));

test("async execution", async () =>
  await equal(
    <Timeout ms={1}>
      <Headline />
    </Timeout>,
    "<div><h1>Hello World</h1></div>",
  ));

test("nested async components", () => {
  const Inner = async ({ children }: { children: JSX.Children }) => <b>{children}</b>;
  const Outer = async ({ children }: { children: JSX.Children }) => <Inner>{children}</Inner>;
  return equal(<Outer>x</Outer>, `<b>x</b>`);
});

test("async siblings keep their order", () =>
  equal(
    <>
      <Timeout ms={10}>a</Timeout>
      <Timeout ms={1}>b</Timeout>
    </>,
    `<div>a</div><div>b</div>`,
  ));

test("component returning null", () => {
  const Nothing = () => null;
  return equal(
    <p>
      <Nothing />
    </p>,
    `<p></p>`,
  );
});

test("component returning undefined", () => {
  const Undefined = () => undefined;
  return equal(<Undefined />, ``);
});

test("component returning string is escaped", () => {
  const Str = () => "<b>";
  return equal(<Str />, `&lt;b&gt;`);
});

test("component returning zero", () => {
  const Zero = () => 0;
  return equal(<Zero />, `0`);
});

test("sync component error rejects", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  return assert.rejects(async () => jsxToString.call({}, <Broken />), /boom/);
});

test("a tag that is neither a string nor a function rejects", async () => {
  const cases: [any, string][] = [
    [undefined, "undefined"],
    [null, "null"],
    [{}, "object"],
    [42, "number"],
  ];
  for (const [tag, type] of cases) {
    await assert.rejects(async () => jsxToString.call({}, classicCreateElement(tag, null, "x")), {
      name: "TypeError",
      message: new RegExp(`got ${type}\\. Check for a missing import`),
    });
  }
});

test("sync component error is returned as rejected promise", () => {
  const Broken = () => {
    throw new Error("boom");
  };
  const result = jsxToString.call({}, <Broken />);
  assert.ok(result instanceof Promise);
  return assert.rejects(result, /boom/);
});

test("async component error rejects", () => {
  const Broken = async () => {
    throw new Error("boom async");
  };
  return assert.rejects(async () => jsxToString.call({}, <Broken />), /boom async/);
});

// The build type-checks the render prop calls against these types.
const Loader = ({ children }: { children: (data: string) => JSX.Element }) => children("data");

const AsyncLoader = async ({ children }: { children: (data: string) => JSX.Element }) =>
  children(await delay(1, "async data"));

test("function child is passed to the component as a render prop", () =>
  equal(<Loader>{(data) => <p>{data}</p>}</Loader>, `<p>data</p>`));

test("render prop with an async component", () =>
  equal(<AsyncLoader>{(data) => <p>{data}</p>}</AsyncLoader>, `<p>async data</p>`));

test("render prop passed as children prop and with createElement", async () => {
  const render = (data: string) => <b>{data}</b>;
  await equal(<Loader children={render} />, `<b>data</b>`);
  await equal(classicCreateElement(Loader, null, render), `<b>data</b>`);
});

// The build type-checks these components against their children types.
test("a single child is passed to the component as is", async () => {
  const Shout = ({ children }: { children: string }) => <b>{children.toUpperCase()}</b>;
  const Increment = ({ children }: { children: number }) => children + 1;
  const TagName = ({ children }: { children: any }) => children.tag;
  await equal(<Shout>hello</Shout>, `<b>HELLO</b>`);
  await equal(<Increment>{1}</Increment>, `2`);
  await equal(
    <TagName>
      <i>x</i>
    </TagName>,
    `i`,
  );
});

test("an array child is passed to the component as is", () => {
  const Join = ({ children }: { children: string[] }) => children.join("-");
  return equal(<Join>{["a", "b"]}</Join>, `a-b`);
});

test("several children are passed to the component as an array, as written", () => {
  const Values = ({ children }: { children: unknown[] }) => children.map(String).join();
  return equal(
    <Values>
      {"a"}
      {null}
      {false}
      {1}
    </Values>,
    `a,null,false,1`,
  );
});

test("a component without children gets no children prop", () => {
  const Props = (props: Record<string, unknown>) => String("children" in props);
  return equal(<Props />, `false`);
});

test("functions among several children are kept", () => {
  const Types = ({ children }: { children: unknown[] }) =>
    children.map((child) => typeof child).join();
  return equal(
    <Types>
      a{() => "x"}
      {1}
    </Types>,
    `string,function,number`,
  );
});
