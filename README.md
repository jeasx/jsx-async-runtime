# jsx-async-runtime

An asynchronous JSX runtime without dependencies to be used as html template engine for server or browser.

This runtime was initially developed for [Jeasx](https://www.jeasx.dev), but has a value of its own. Its main focus is to keep things simple, reliable, secure and fast.

You can find more information about using this runtime as template engine in the [Jeasx documentation](https://www.jeasx.dev/jsx).

## Getting started

### Installation

```bash
npm i jsx-async-runtime
```

### Configuration

To make use of the `jsx-async-runtime`, you need to configure your transpiler to utilize this package for transforming the JSX syntax.

If you are using TypeScript or esbuild for transpiling your code base, simply set these options in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "jsx-async-runtime"
  }
}
```

## Using

If you're using `jsx-async-runtime` as template engine, you might want to include data from an asynchronous operation in the resulting markup. To simplify this process, you can make your components asynchronous and send async requests from within them.

## HTML escaping as default (breaking change for >= v2.x.x)

`jsx-async-runtime >= v2.x.x` escapes all HTML entities for texts per default to prevent cross site scripting. If you want or need to opt out this security feature to include literal HTML snippets in your template (e.g. WYSIWYG content from a CMS), you can provide an object with a single key called `__html` containing the code snippet as a string in your JSX template:

```jsx
<div>{{__html: "<p>Some <b>HTML</b> from a CMS</p>"}}</div>
```

If you want to disable the automatic escaping of HTML completely to restore the behaviour of `jsx-async-runtime < v2.x.x`, you can turn off text escaping with a compatibilty switch via the `this` context:

```jsx
export default function () {
  this.jsxEscapeHTML = false;
  return <div>{"<p>Some <b>HTML</b> from a CMS</p>"}</div>
}
```

## Example project

You can study the [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example) to learn more about all existing features. Here is a shortened version to give you the idea:

```jsx
import { jsxToString } from "jsx-async-runtime";

export default function App() {
  return (
    <>
      {{__html: `<!DOCTYPE html>`}}
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

// Use jsxToString#call with {} to create 'this' context
console.log(await jsxToString.call({}, <App />));
```
