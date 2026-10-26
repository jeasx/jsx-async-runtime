# jsx-async-runtime

An asynchronous JSX runtime without dependencies, to be used as an HTML template engine on the server or in the browser.

- **Async components**: `await` data right inside your components.
- **Secure by default**: text and attribute values are escaped, invalid tag and attribute names are skipped.
- **Fast**: renders synchronously until it hits an async component, and only then returns a promise.
- **Streaming**: send the markup rendered so far while slow components are still loading.
- **No dependencies**, no virtual DOM, no hooks. Just functions that return markup.

This runtime was initially developed for [Jeasx](https://www.jeasx.dev), but has a value of its own. Its main focus is to keep things simple, reliable, secure and fast. More information about using it as a template engine can be found in the [Jeasx documentation](https://www.jeasx.dev/jsx).

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
import { jsxToString } from "jsx-async-runtime";

export default function HelloWorld({ greeting }) {
  return (
    <>
      {{ html: `<!DOCTYPE html>` }}
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

// Use jsxToString#call with {} to create a 'this' context
console.log(await jsxToString.call({}, <HelloWorld greeting="Hello World" />));
```

## Async components

Components can be `async`, so you can load data right where you need it:

```jsx
export default async function Todos() {
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
```

Promises passed as children are awaited as well, e.g. `<div>{loadGreeting()}</div>`. The output order always matches the order in your JSX.

`jsxToString` returns a plain `string` as long as no component had to wait, and a `Promise<string>` otherwise. Using `await` works in both cases.

## Escaping HTML

All text and attribute values are HTML-escaped by default to prevent cross-site scripting. To include a literal HTML snippet (e.g. the doctype or WYSIWYG content from a CMS), pass an object with a single `html` key:

```jsx
<div>{{ html: "<p>Some <b>HTML</b> from a CMS</p>" }}</div>
```

To restore the behaviour of `jsx-async-runtime < v2.x.x` and turn off text escaping completely, set `jsxEscapeHTML` on the `this` context:

```jsx
export default function () {
  this.jsxEscapeHTML = false;
  return <div>{"<p><b>HTML</b> from a trusted CMS</p>"}</div>;
}
```

With escaping turned off, use `escapeEntities` for markup from untrusted sources:

```jsx
import { escapeEntities } from "jsx-async-runtime";

export default function () {
  this.jsxEscapeHTML = false;
  return <div>{escapeEntities("<p><b>HTML</b> from user input</p>")}</div>;
}
```

Attribute values are always escaped. Tag and attribute names containing whitespace, quotes, `<`, `>`, `/`, `=`, `&` or control characters are skipped, so names from untrusted input can't inject markup.

## Attributes

Attributes use their HTML names (`class`, `for`, `onclick`), not the React names (`className`, `htmlFor`, `onClick`).

| Value                                     | Renders as                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `"text"`                                  | `name="text"` (escaped)                                                          |
| `true`                                    | `name`                                                                           |
| `false`, `null`, `undefined`              | nothing                                                                          |
| function or symbol                        | nothing                                                                          |
| `style={{ "padding-top": "1rem" }}`       | `style="padding-top: 1rem"` (`null`, `undefined` and `false` values are skipped) |
| `class={{ active: true, hidden: false }}` | `class="active"`                                                                 |
| `class={["a", cond && "b"]}`              | `class="a b"` (falsy entries are skipped)                                        |
| plain object or array                     | JSON, e.g. `data-config="{&quot;a&quot;:1}"`                                     |
| anything else (`URL`, `Date`, numbers)    | its string form, e.g. `href={new URL("https://example.com")}`                    |

Style properties use CSS names (`background-color`, not `backgroundColor`). `key` is never rendered as an attribute.

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

Components using `this` must be regular `function`s, not arrow functions. Create a new context object for each render (e.g. per request), so data doesn't leak between them.

## Streaming

Instead of waiting for the complete document, you can stream the markup with `jsxToStream`. It renders in the same order as `jsxToString`, but returns a `ReadableStream<string>`. Markup rendered so far is sent as a chunk whenever rendering waits for an async component, so the browser can start loading styles and scripts from the `<head>` while slow data is still being fetched.

```jsx
import { jsxToStream } from "jsx-async-runtime";
import { createServer } from "node:http";
import { Readable } from "node:stream";

createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  // Use jsxToStream#call with {} to create a 'this' context
  Readable.fromWeb(jsxToStream.call({}, <App />)).pipe(response);
}).listen(3000);
```

Things to keep in mind:

- Once a chunk is sent, it can't be changed. If a component throws, the stream ends with an error after the chunks already sent, so the response can't switch to an error page anymore.
- Patterns that change the markup after rendering (like the head unification in the [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example)) don't work with streaming.
- A `this.jsxToString` override is still honored, but returns a string, so everything it renders is sent as one chunk.

## Customizing rendering

Set `this.jsxToString` to intercept the rendering of every nested element. The override receives the element (`{ tag, props }`) and returns a string or a promise of one. Call the original `jsxToString` to fall back to the default rendering:

```jsx
import { jsxToString } from "jsx-async-runtime";

const context = {
  jsxToString(jsxElement) {
    if (jsxElement?.tag === "script") {
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
| `escapeEntities(input)`                  | Escapes `&`, `<`, `>`, `"` and `'` in a string.                                 |
| `createElement(tag, props, ...children)` | Creates an element without JSX syntax (classic runtime).                        |

Context properties read by the runtime:

| Property        | Description                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| `jsxEscapeHTML` | Set to `false` to turn off escaping of text. Defaults to `true`.                             |
| `jsxToString`   | Override for rendering nested elements. See [Customizing rendering](#customizing-rendering). |

## Example project

The [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example) shows all features in a small web server. Here is a shortened version:

```jsx
import { jsxToString } from "jsx-async-runtime";

export default function App() {
  return (
    <>
      {{ html: `<!DOCTYPE html>` }}
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

// Use jsxToString#call with {} to create a 'this' context
console.log(await jsxToString.call({}, <App />));
```

## License

MIT
