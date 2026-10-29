import { createElement as classicCreateElement, html } from "jsx-async-runtime";
import { createElement } from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import test from "node:test";
import Headline from "./components/Headline.js";
import { equal } from "./helpers/equal.js";

test("fragments", () =>
  equal(
    <>
      <main>
        <>
          <div>
            <Headline />
          </div>
        </>
      </main>
    </>,
    `<main><div><h1>Hello World</h1></div></main>`,
  ));

test("empty fragment", () => equal(<></>, ``));

test("void tags", () =>
  equal(
    <>
      <hr />
      <br />
      <img src="src" alt="" />
      <link href="/" />
      <input type="text" />
    </>,
    `<hr><br><img src="src" alt=""><link href="/"><input type="text">`,
  ));

test("void tags ignore children", () => {
  let called = false;
  const Child = () => {
    called = true;
    return "x";
  };
  return equal(
    <>
      <br>text</br>
      <img src="src">
        <Child />
      </img>
    </>,
    `<br><img src="src">`,
  ).then(() => assert.equal(called, false));
});

test("uppercase and capitalized void tags are void too", () =>
  equal(
    // Capitalized JSX names are components, so build the tags with createElement.
    <>
      {classicCreateElement("BR")}
      {classicCreateElement("IMG", { src: "src" }, "text")}
      {classicCreateElement("Br")}
      {classicCreateElement("Img", { src: "src" }, "text")}
    </>,
    `<BR><IMG src="src"><Br><Img src="src">`,
  ));

test("doctype declaration", () =>
  equal(
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
        </head>
      </html>
    </>,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"></head></html>`,
  ));

test("valid tag names are kept", () =>
  equal(
    <>
      <my-element />
      <my-élément />
      <foreignObject />
    </>,
    `<my-element></my-element><my-élément></my-élément><foreignObject></foreignObject>`,
  ));

test("invalid tag names are skipped", () =>
  equal(
    <p>
      {["div onmouseover=alert(1)", "div>", "x/y", "1div", "<script", "a\nb", "a\u0000"].map(
        (tag) => createElement(tag, { id: "x" }, "child"),
      )}
    </p>,
    `<p></p>`,
  ));
