import { escapeEntities, jsxToString } from "jsx-async-runtime";

export default function App({ url = "/" }) {
  // In the given setup you can use "this" as context
  // to pass data to subcomponents to avoid prop drilling.
  this.timestamp = new Date();

  // Check url for custom theme
  this.customTheme = url.includes("theme=custom");

  // Register a custom jsxToString function via 'this' to patch components.
  // This serves as an example of how to modify or replace existing markup
  // which can't be controlled by your application (e.g. 3rd-party components).
  if (this.customTheme) {
    const $jsxToString = this.jsxToString || jsxToString;
    this.jsxToString = (jsxElement) => {
      // '$jsx' is used as marker prop for processed elements
      // to avoid endless recursion
      if (jsxElement?.props?.["$jsx"]) {
        delete jsxElement.props["$jsx"];
      } else {
        switch (typeof jsxElement?.tag) {
          case "string":
            switch (jsxElement.tag) {
              case "body":
                jsxElement.tag = ({ children }) => (
                  <body $jsx style="background-color: azure;">
                    {children}
                  </body>
                );
                break;
            }
            break;
          case "function":
            switch (jsxElement.tag.name) {
              case "Logo":
                // Replace <Logo> components with custom markup
                jsxElement.tag = ({ title }) => (
                  <div
                    $jsx
                    style="background-color: orange; border-radius: 25px;"
                  >
                    <h1>* {escapeEntities(title)} *</h1>
                    <h2>powered by jsx-async-runtime</h2>
                  </div>
                );
                break;
            }
            break;
        }
      }
      return $jsxToString.call(this, jsxElement);
    };
  }

  return (
    <>
      {"<!DOCTYPE html>"}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="description" content="Default description" />
          <title>Default title</title>
          <style>
            {
              /* css */ `body {font-family: sans-serif; line-height: 1.5;}
input[type="text"] {border: 1px solid #aaa; padding: 4px; width: 40em;}
.striped tr:nth-child(odd) {background-color: orange; padding: 4px;}`
            }
          </style>
        </head>
        <body>
          <Layout title="<Todos>">
            <Todos quantity={11} />
            <Todos quantity={0} />
          </Layout>
          <hr />
          <ThemeSwitch />
        </body>
      </html>
    </>
  );
}

// Provide default value for 'children' to avoid type errors
function Layout({ title, children = [] }) {
  return (
    <main style="text-align: center">
      <head>
        <title>{escapeEntities(title)}</title>
        <meta
          name="description"
          content={`This is the description for ${escapeEntities(title)}`}
        />
        <style>{/* css */ `h1 {background-color: red;}`}</style>
      </head>
      <Logo title={title} />
      {children}
    </main>
  );
}

function Logo({ title }) {
  return (
    <h1
      style={
        // Create inline styles via an object
        {
          "background-image": 'url("https://picsum.photos/1200/200")',
          "background-color": "red",
          color: "white",
          "padding-top": "1rem",
          "padding-bottom": "1rem",
        }
      }
    >
      <svg
        width="32px"
        height="32px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {escapeEntities(title)}
    </h1>
  );
}

// Use async/await in your components if you need to wait for a response
async function Todos({ quantity }) {
  const { todos } = await (await fetch("https://dummyjson.com/todos")).json();
  todos.sort(() => Math.random() - 0.5); // shuffle array

  return (
    quantity > 0 && (
      <table style="margin: 0 auto; padding: 1rem; border: 1px solid lightgrey">
        <thead
          class={
            // Generate space separated class names for true properties
            {
              striped: false,
              sticky: true,
              '"classname-with-quotes"': true,
            }
          }
          // For all attributes besides class & style objects get stringified
          data-props={{ foo: "bar", count: 10 }}
        >
          <tr
            // Use array for class names, join string values with space
            class={["a", "b", "", undefined, "c"]}
          >
            <th>Label</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody class="striped">
          {todos.slice(0, quantity).map(({ todo, completed }, index) => (
            <tr>
              <td>
                <label for={`todo-${index}`}>
                  <input
                    id={`todo-${index}`}
                    type="text"
                    readonly
                    value={escapeEntities(todo)}
                  />
                </label>
              </td>
              <td>
                <label for={`status-${index}`}>
                  <input
                    id={`status-${index}`}
                    type="checkbox"
                    checked={
                      /* Property comes from an untrusted source, so don't use it directly */
                      String(completed) === "true"
                    }
                  />
                </label>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colspan={3}>
              <p>
                <i>The current time is {this.timestamp.toLocaleTimeString()}</i>
              </p>
            </td>
          </tr>
        </tfoot>
      </table>
    )
  );
}

function ThemeSwitch() {
  return (
    <div style="text-align: center;">
      {this.customTheme ? (
        <a href="?theme=default">Use default theme</a>
      ) : (
        <a href="?theme=custom">Use custom theme</a>
      )}
    </div>
  );
}
