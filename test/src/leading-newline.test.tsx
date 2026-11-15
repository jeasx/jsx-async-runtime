import { createElement } from "jsx-async-runtime";
import test from "node:test";
import { equal } from "./helpers/equal.js";

// The HTML parser drops a newline right after the start tag of <pre>, <textarea> and <listing>,
// so the runtime writes one there, and a leading newline of the content is kept.

test("newline after <pre> keeps a leading newline", () =>
  equal(<pre>{"\nx"}</pre>, `<pre>\n\nx</pre>`));

test("newline after <textarea> keeps a leading newline", () =>
  equal(<textarea name="a">{"\nx"}</textarea>, `<textarea name="a">\n\nx</textarea>`));

test("newline after <listing> keeps a leading newline", () =>
  equal(createElement("listing", null, "\nx"), `<listing>\n\nx</listing>`));

test("leading CRLF and CR are kept", async () => {
  await equal(<pre>{"\r\nx"}</pre>, `<pre>\n\r\nx</pre>`);
  await equal(<textarea>{"\rx"}</textarea>, `<textarea>\n\rx</textarea>`);
});

test("newline is written when the content has no leading newline", () =>
  equal(<pre>x</pre>, `<pre>\nx</pre>`));

test("newline is written for empty content", async () => {
  await equal(<textarea></textarea>, `<textarea>\n</textarea>`);
  await equal(<textarea>{false}</textarea>, `<textarea>\n</textarea>`);
});

test("newline is written once for multiple children", () =>
  equal(
    <pre>
      {false}
      {"\na"}
      {"b"}
    </pre>,
    `<pre>\n\nab</pre>`,
  ));

test("newline is written before content from a promise", () =>
  equal(<textarea>{Promise.resolve("\nx")}</textarea>, `<textarea>\n\nx</textarea>`));

test("newline is written before content from a component", () => {
  const Value = async () => "\nx";
  return equal(
    <pre>
      <Value />
    </pre>,
    `<pre>\n\nx</pre>`,
  );
});

test("newline is written before content from bytes", () =>
  equal(<pre>{Buffer.from("\nx")}</pre>, `<pre>\n\nx</pre>`));

test("newline is written before content from a stream", () =>
  equal(() => <pre>{new Response("\nx").body}</pre>, `<pre>\n\nx</pre>`));

test("newline is written after a start tag with promise attributes", () =>
  equal(
    <textarea name={Promise.resolve("a")}>{"\nx"}</textarea>,
    `<textarea name="a">\n\nx</textarea>`,
  ));

test("newline is written for uppercase and capitalized tags", async () => {
  await equal(createElement("PRE", null, "\nx"), `<PRE>\n\nx</PRE>`);
  await equal(createElement("Textarea", null, "\nx"), `<Textarea>\n\nx</Textarea>`);
});

test("<code> inside <pre> gets no newline", () =>
  equal(
    <div>
      <pre>
        <code>{"\nx"}</code>
      </pre>
    </div>,
    `<div><pre>\n<code>\nx</code></pre></div>`,
  ));

test("other tags get no newline", () => equal(<div>{"\nx"}</div>, `<div>\nx</div>`));
