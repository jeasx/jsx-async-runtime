# jsx-async-runtime

An asynchronous JSX runtime without dependencies, to be used as an HTML template engine on the server or in the browser.

- **Async components**: `await` data right inside your components.
- **Secure by default**: text and attribute values are escaped, invalid tag and attribute names are skipped.
- **Fast**: renders synchronously until it hits an async component, and only then returns a promise.
- **Streaming**: send the markup rendered so far while slow components are still loading.
- **No dependencies**, no virtual DOM, no hooks. Just functions that return markup.

This runtime was initially developed for [Jeasx](https://www.jeasx.dev), but has a value of its own. Its main focus is to keep things simple, reliable, secure and fast. More information about using it as a template engine can be found in the [Jeasx documentation](https://www.jeasx.dev/jsx).

Please have a look at the [CHANGELOG](./CHANGELOG.md) before upgrading your project.

## Contents

- [Installation](#installation)
- [Async components](#async-components)
- [Escaping HTML](#escaping-html)
- [Attributes](#attributes)
- [The `this` context](#the-this-context)
- [Streaming](#streaming)
- [Customizing rendering](#customizing-rendering)
- [API](#api)
- [Example project](#example-project)

## Installation

```bash
npm i jsx-async-runtime
```

Configure your transpiler to use this package for JSX. With TypeScript or esbuild, add the following options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "jsx-async-runtime"
  }
}
```

The example project provides a complete [tsconfig.json](https://github.com/jeasx/jsx-async-runtime/tree/main/example/tsconfig.json) with all required options. For a ready-made setup, check out the [quickstart repository with TypeScript support](https://github.com/jablonski/jsx-async-runtime-quickstart).

Now create a test file (e.g. `src/HelloWorld.jsx`) and run it via `npx tsx src/HelloWorld.jsx`:

```jsx
import { html, jsxToString } from "jsx-async-runtime";

function HelloWorld({ greeting }) {
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html>
        <head>
          <meta charset="utf-8" />
          <title>{greeting}</title>
        </head>
        <body>
          <h1>{greeting}</h1>
        </body>
      </html>
    </>
  );
}

console.log(jsxToString(<HelloWorld greeting="Hello World" />));
```

## Async components

Components can be `async`, so you can load data right where you need it:

```jsx
async function Todos() {
  const { todos } = await (await fetch("https://dummyjson.com/todos")).json();

  return (
    <ul>
      {todos.map(({ todo, completed }) => (
        <li>
          {todo} ({completed ? "yes" : "no"})
        </li>
      ))}
    </ul>
  );
}

console.log(await jsxToString(<Todos />));
```

Promises passed as children or attribute values are awaited as well, e.g. `<div>{loadGreeting()}</div>` or `<img src={loadImageUrl()} />`. All promise attributes of a tag are awaited in parallel. The output order always matches the order in your JSX.

Besides arrays, any other iterable can be used as children, e.g. a `Set`, a generator or `users.values().map((user) => <li>{user.name}</li>)`. Components may return them as well. Generators and other iterators are read when they are rendered and can be read only once, so render each one only once.

Bytes (a `Uint8Array` or `Buffer`) are rendered as UTF-8 text and escaped like any other string, so a file from `readFile()` or a `fetch()` body can be rendered directly, e.g. `<pre>{(await fetch(url)).body}</pre>`.

Objects with their own `toString` method, e.g. a `Date`, `URL`, `Error` or an instance of your own class, render their string form, escaped like any other string: `<p>{new URL("https://example.com")}</p>` renders `<p>https://example.com/</p>`. Plain objects (e.g. parsed JSON) and class instances without their own `toString` render nothing instead of `[object Object]`.

A component receives its children as written, like in React and as TypeScript types them: a single child as is (e.g. a string or an element), several children as an array, and no `children` prop without children. So a single function child works as a render prop:

```jsx
async function Loader({ children }) {
  const data = await loadData();
  return children(data);
}

<Loader>{(data) => <p>{data.title}</p>}</Loader>;
```

Async iterables work the same way, e.g. an async generator or a `ReadableStream`. Their items are rendered in order as they arrive, and `jsxToStream` sends the markup so far while waiting for each item. An async generator component lets you render rows straight from a paginated API or a database cursor:

```jsx
async function* Users() {
  for await (const user of db.users.find()) {
    yield <li>{user.name}</li>;
  }
}

<ul>
  <Users />
</ul>;
```

If rendering fails or the stream reader cancels, the source is stopped like a `for await` loop does on `break`, so an async generator runs its `finally` block and can close the cursor. A `ReadableStream` child that rendering never got to (e.g. a `fetch()` body after an earlier component threw) is cancelled, so it doesn't keep the connection open. Streams passed as other props are left to the component. An async iterable can be read only once, so render each one only once.

Async components run one after another: a component is only called once everything before it has finished rendering. Two sibling components that each wait one second take two seconds in total. To load data in parallel, start the work first and pass the promises down, either as children or as props:

```jsx
function Page() {
  // Both requests start right away and run in parallel.
  const user = loadUser();
  const todos = loadTodos();

  return (
    <main>
      <UserCard user={user} />
      <section>
        {todos.then((todos) => (
          <TodoList todos={todos} />
        ))}
      </section>
    </main>
  );
}

async function UserCard({ user }) {
  const { name } = await user;
  return <h2>{name}</h2>;
}
```

Starting promises early is safe: if one rejects before rendering gets to it, the error is reported when the promise is rendered or awaited, like any other component error, instead of crashing Node as an unhandled rejection. Promises inside an array prop (e.g. `users={[loadUser(1), loadUser(2)]}`) or directly inside an object prop (e.g. `data={{ user }}`) are covered too. Objects inside objects or arrays aren't checked, so passing large data stays cheap. Pass promises nested that deep (e.g. `data={{ profile: { user } }}` or `users={[{ avatar }]}`) as their own prop.

`jsxToString` returns a plain `string` as long as no component had to wait, and a `Promise<string>` otherwise. Using `await` works in both cases.

`jsxToString` never throws. If a component throws (sync or async), it returns a rejected promise, so one `try`/`catch` around `await` handles all errors:

```jsx
try {
  const html = await jsxToString(<App />);
} catch (error) {
  // Handle errors from any component, e.g. render an error page.
}
```

Without `await` (e.g. `jsxToString(...).catch(...)`), check for a string first: a successful sync render returns a string, which has no `.catch()`.

## Escaping HTML

All text and attribute values are HTML-escaped by default to prevent cross-site scripting. To include a literal HTML snippet (e.g. the doctype or WYSIWYG content from a CMS), wrap it in `html()`:

```jsx
import { html } from "jsx-async-runtime";

<div>{html("<p>Some <b>HTML</b> from a CMS</p>")}</div>;
```

Only markup created by `html()` is rendered raw. Plain objects like `{ html: "..." }` render nothing, so data parsed from JSON (e.g. a request body like `{"text": {"html": "<script>..."}}`) can't inject markup when passed as a child.

This also applies to `<script>` and `<style>`: their text content is escaped like any other text, so `<script>{"if (a < b) {}"}</script>` renders `if (a &lt; b) {}`, which breaks the code. Wrap inline scripts and styles in `html()`:

```jsx
<script>{html(`if (a < b) { console.log("ok"); }`)}</script>
<style>{html(`a > span { color: red; }`)}</style>
```

Never put untrusted input into an inline script this way. To pass data to a script, use JSON with `<` escaped, so a value containing `</script>` can't end the script early:

```jsx
<script>{html(`const data = ${JSON.stringify(data).replaceAll("<", "\\u003c")};`)}</script>
```

When you build markup as a string yourself, escape untrusted values in it with `escapeEntities`:

```jsx
import { escapeEntities, html } from "jsx-async-runtime";

<div>{html(`<p>Hello <b>${escapeEntities(user.name)}</b></p>`)}</div>;
```

Escaping can't be turned off for the whole page, so a `<p>{comment}</p>` can't render unescaped by accident. If you really need raw text everywhere (e.g. a trusted HTML stream from `fetch()`, which `html()` can't wrap), let a [`this.jsxToString` override](#customizing-rendering) return text as is:

```jsx
const decoder = new TextDecoder();
const context = {
  jsxToString(jsxElement) {
    if (typeof jsxElement === "string") return jsxElement;
    if (jsxElement instanceof Uint8Array) return decoder.decode(jsxElement);
    return jsxToString.call(this, jsxElement);
  },
};
```

Attribute values are always escaped. Tag and attribute names containing whitespace, quotes, `<`, `>`, `/`, `=`, `&` or control characters are skipped, so a name from untrusted input can't break out of the tag and inject markup.

Valid names are still rendered as written, and some of them run code. Spreading untrusted data onto an element, e.g. `<div {...body} />` with a request body like `{"onmouseover": "alert(1)"}`, adds a working event handler, and `srcdoc` on an `<iframe>` runs any script in its value. Dynamic tags work the same way: `createElement(props.as, null, text)` with `"script"` as the tag runs `text` as code. Pass only the attributes you expect, and allow only known tags:

```jsx
// Pick known attributes instead of spreading untrusted data.
<div title={body.title} lang={body.lang} />;

// Allow only known tags for a dynamic tag name.
const Heading = ["h1", "h2", "h3"].includes(level) ? level : "h2";
<Heading>{text}</Heading>;
```

Only elements created by JSX or `createElement` are rendered. Objects that merely look like elements, e.g. `{ "tag": "script", ... }` parsed from a request body, render nothing, so user data passed as a child can't inject tags. To build elements in code, use `createElement`.

Escaping doesn't check what a value means. URLs are not validated, so `href={userInput}` can still contain a `javascript:` link. Check URLs from untrusted sources yourself (e.g. allow only `http:` and `https:`).

The same goes for styles. Style values are escaped for HTML, but not checked as CSS, so `style={{ color: userInput }}` with `"red; background: url(https://evil.example)"` adds a second property. Don't put untrusted input into styles, or allow only known values (e.g. a list of colors).

## Attributes

Attributes use their HTML names (`class`, `for`, `onclick`), not the React names (`className`, `htmlFor`, `onClick`).

| Value                                     | Renders as                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `"text"`                                  | `name="text"` (escaped)                                                          |
| `true`                                    | `name`                                                                           |
| `false`, `null`, `undefined`              | nothing                                                                          |
| function or symbol                        | nothing                                                                          |
| element or `html()`, e.g. `title={<b />}` | nothing                                                                          |
| promise, e.g. `title={loadTitle()}`       | awaited, then rendered like its value                                            |
| `style={{ "padding-top": "1rem" }}`       | `style="padding-top: 1rem"` (`null`, `undefined`, `false` and `""` are skipped)  |
| `class={{ active: true, hidden: false }}` | `class="active"`                                                                 |
| `class={["a", cond && "b"]}`              | `class="a b"` (falsy entries are skipped)                                        |
| `class={["a", ["b"], { c: true }]}`       | `class="a b c"` (arrays may nest and contain objects)                            |
| plain object or array                     | JSON, e.g. `data-config="{&quot;a&quot;:1}"`                                     |
| anything else (`URL`, `Date`, numbers)    | its string form, e.g. `href={new URL("https://example.com")}`                    |

Style properties use CSS names (`background-color`, not `backgroundColor`). Keys are rendered exactly as written and camelCase isn't converted, so `style={{ fontSize: "1rem" }}` renders `style="fontSize: 1rem"`, which browsers ignore. Custom properties work as written, e.g. `style={{ "--gap": "1rem" }}`. `key` is accepted (e.g. when mapping lists), but never rendered as an attribute.

## The `this` context

When you call `jsxToString.call(context, jsx)`, every component receives `context` as `this`. Use it to share data with deeply nested components instead of passing props through every level:

```jsx
function App({ user }) {
  this.user = user;
  return <Layout />;
}

function Greeting() {
  return <p>Hello {this.user.name}</p>;
}
```

Components using `this` must be regular `function`s, not arrow functions. Create a new context object for each render (e.g. per request), so data doesn't leak between them. Without `.call()`, e.g. `jsxToString(<App />)`, each render gets a new empty context.

## Streaming

Instead of waiting for the complete document, you can stream the markup with `jsxToStream`. It renders in the same order as `jsxToString`, but returns a `ReadableStream<string>`. Markup rendered so far is sent as a chunk whenever rendering waits for an async component, so the browser can start loading styles and scripts from the `<head>` while slow data is still being fetched. Large pages are also sent in chunks of about 16 KB, even when no component is async, and rendering pauses while the client is slow to read, so the complete page doesn't have to be held in memory.

```jsx
import { jsxToStream } from "jsx-async-runtime";
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

createServer(async (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  try {
    await pipeline(Readable.fromWeb(jsxToStream(<App />)), response);
  } catch (error) {
    // A component threw or the client disconnected; the response is already closed.
    console.error(error);
  }
}).listen(3000);
```

Use `pipeline` rather than `.pipe()`: it closes the response when a component throws and stops rendering when the client disconnects. `.pipe()` doesn't handle stream errors, so a single failing component would crash the server.

The web `Response` API (e.g. in Deno, Bun, Cloudflare Workers or Hono) expects bytes, so encode the markup with a `TextEncoderStream`:

```jsx
// e.g. in the fetch handler of your runtime or framework
const stream = jsxToStream(<App />).pipeThrough(new TextEncoderStream());
return new Response(stream, {
  headers: { "Content-Type": "text/html; charset=utf-8" },
});
```

Things to keep in mind:

- Once a chunk is sent, it can't be changed. If a component throws, the stream ends with an error after the chunks already sent, so the response can't switch to an error page anymore.
- Patterns that change the markup after rendering (like the head unification in the [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example)) don't work with streaming.
- A `this.jsxToString` override is still honored, but returns a string, so everything it renders is sent as one chunk. When the client disconnects, rendering inside the override stops too, as long as each stream gets its own context object.

## Customizing rendering

Set `this.jsxToString` to intercept the rendering of every nested element. The override receives everything that is about to be rendered: elements (`{ tag, props }`), but also children as written, like strings, numbers, (nested) arrays, `null` or `false`. Check for elements with `isJsxNode` before reading `tag` or `props`; in TypeScript, it also narrows the type, so `jsxElement.tag` type-checks. It returns a string or a promise of one; `""`, `null` and `undefined` render nothing. Call the original `jsxToString` to fall back to the default rendering:

```jsx
import { isJsxNode, jsxToString } from "jsx-async-runtime";

const context = {
  jsxToString(jsxElement) {
    if (isJsxNode(jsxElement) && jsxElement.tag === "script") {
      return ""; // drop all scripts
    }
    return jsxToString.call(this, jsxElement);
  },
};

const html = await jsxToString.call(context, <App />);
```

This lets you patch markup you don't control (e.g. third-party components) or collect elements during rendering. The [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example) uses it to replace components for a custom theme and to merge all `<head>` elements into one.

## API

| Export                                   | Description                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| `jsxToString.call(context, jsx)`         | Renders to `string`, or `Promise<string>` if a component had to wait.           |
| `jsxToStream.call(context, jsx)`         | Renders to a `ReadableStream<string>`, sending chunks whenever rendering waits. |
| `html(markup)`                           | Marks a string as raw markup that is rendered without escaping.                 |
| `escapeEntities(input)`                  | Escapes `&`, `<`, `>`, `"` and `'`. Other values are converted to a string first. |
| `isJsxNode(value)`                       | Checks for an element or `html()` markup; look-alikes from JSON don't count.    |
| `createElement(tag, props, ...children)` | Creates an element without JSX syntax (classic runtime).                        |
| `Fragment`                               | Fragment tag for `createElement`, e.g. `createElement(Fragment, null, a, b)`.   |

Context properties read by the runtime:

| Property        | Description                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `jsxToString`   | Override for rendering nested elements. See [Customizing rendering](#customizing-rendering). |

## Example project

The [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example) shows all features in a small web server. Here is a shortened version:

```jsx
import { html, jsxToString } from "jsx-async-runtime";

export default function App() {
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Todos</title>
        </head>
        <body>
          <Header label="<Todos>" />
          <TodoList quantity={3} />
        </body>
      </html>
    </>
  );
}

function Header({ label }) {
  return (
    <section
      style={{
        "background-color": "red",
        "padding-bottom": "1rem",
      }}
    >
      <h1 style="color: white; text-align: center">{label}</h1>
    </section>
  );
}

async function TodoList({ quantity }) {
  const { todos } = await (await fetch("https://dummyjson.com/todos")).json();

  return (
    <table class="table">
      <thead class={{ thead: true, striped: false, sticky: true }}>
        <tr>
          <th>Label</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody class="tbody striped">
        {todos.slice(0, quantity).map(({ todo, completed }) => (
          <tr>
            <td>
              <label for="todo">{todo}</label>
            </td>
            <td>
              <label for="status">{completed ? "yes" : "no"}</label>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

console.log(await jsxToString(<App />));
```

## License

MIT
