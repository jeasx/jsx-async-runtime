# jsx-async-runtime

An asynchronous JSX runtime without dependencies to be used as html template engine.

## Getting started

### Installation

```bash
npm i jsx-async-runtime
```

### Building

To make use of the `jsx-async-runtime`, you need to configure your transpiler to utilize this package for transforming the JSX syntax.

If you are using TypeScript for transpiling, simply set these options in the tsconfig file:

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

Please note: `jsx-async-runtime` doesn't escape html entities per default, so rendering user input makes your application vulnerable to cross site scripting. `jsx-async-runtime` exports a utility function called `escapeEntities` which can be used to render input from uncontrolled sources.

You can study the [example project](https://github.com/jeasx/jsx-async-runtime/tree/main/example) to learn about existing features.

```jsx
import { escapeEntities, jsxToString } from "jsx-async-runtime";

export default function App() {
  return (
    <>
      {`<!DOCTYPE html>`}
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
      <h1 style="color: white; text-align: center">{escapeEntities(label)}</h1>
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
              <label for="todo">{escapeEntities(todo)}</label>
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
