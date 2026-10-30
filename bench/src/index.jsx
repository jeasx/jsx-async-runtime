import { html, isJsxNode, jsxToStream, jsxToString } from "jsx-async-runtime";
import { run } from "./harness.js";

// Usage: npm run bench [-- <filter>...], e.g. `npm run bench -- stream`.

// --- Data (created once, outside the timed code) ---

const rows = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  price: (i * 1.37).toFixed(2),
  active: i % 3 === 0,
  tags: ["a", "b", "c"].slice(0, (i % 3) + 1),
}));

const comments = Array.from({ length: 1000 }, (_, i) => ({
  author: `User <${i}>`,
  text: `I think "a < b" & 'c > d' holds for case #${i}.`,
}));

// --- Components ---

function Layout({ title, children }) {
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title}</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <nav>
            <ul>
              {["Home", "Products", "About", "Contact"].map((label) => (
                <li>
                  <a href={`/${label.toLowerCase()}`} class={{ active: label === "Products" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <main>{children}</main>
          <footer>
            <p>© 2026 Example</p>
          </footer>
        </body>
      </html>
    </>
  );
}

function Row({ row }) {
  return (
    <tr id={`row-${row.id}`} class={["row", { active: row.active }]} data-id={row.id}>
      <td>{row.id}</td>
      <td>{row.name}</td>
      <td style={{ "text-align": "right", color: row.active ? "green" : null }}>{row.price}</td>
      <td>
        {row.tags.map((tag) => (
          <span class="tag">{tag}</span>
        ))}
      </td>
      <td>
        <input type="checkbox" checked={row.active} disabled />
      </td>
    </tr>
  );
}

function Table() {
  return (
    <Layout title="Products">
      <table>
        <tbody>
          {rows.map((row) => (
            <Row row={row} />
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

function Comments() {
  return (
    <Layout title="Comments">
      {comments.map((c) => (
        <article title={c.author}>
          <h3>{c.author}</h3>
          <p>{c.text}</p>
        </article>
      ))}
    </Layout>
  );
}

// Resolves right away, so the case measures the runtime's promise handling, not timers.
async function AsyncRow({ row }) {
  const data = await Promise.resolve(row);
  return <Row row={data} />;
}

function AsyncTable() {
  return (
    <Layout title="Products">
      <table>
        <tbody>
          {rows.map((row) => (
            <AsyncRow row={row} />
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

// Yields the rows one by one, like a database cursor or a paginated API.
async function* AsyncRows() {
  for (const row of rows) {
    yield <Row row={row} />;
  }
}

function AsyncIterableTable() {
  return (
    <Layout title="Products">
      <table>
        <tbody>
          <AsyncRows />
        </tbody>
      </table>
    </Layout>
  );
}

// A pass-through override like in the README, so every nested element takes the override path.
function createOverrideContext() {
  return {
    jsxToString(jsxElement) {
      if (isJsxNode(jsxElement) && jsxElement.tag === "script") {
        return "";
      }
      return jsxToString.call(this, jsxElement);
    },
  };
}

function SmallPage() {
  return (
    <Layout title="Hello">
      <h1>Hello World</h1>
      <p>A small page with a few elements, like a typical landing page.</p>
    </Layout>
  );
}

// --- Cases ---

async function streamToString(stream) {
  let result = "";
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
}

await run(
  [
    { name: "string: small page", fn: () => jsxToString(<SmallPage />) },
    { name: "string: table, 1,000 rows", fn: () => jsxToString(<Table />) },
    { name: "string: escaping, 1,000 comments", fn: () => jsxToString(<Comments />) },
    { name: "string: async table, 1,000 rows", fn: () => jsxToString(<AsyncTable />) },
    { name: "stream: table, 1,000 rows", fn: () => streamToString(jsxToStream(<Table />)) },
    {
      name: "stream: async table, 1,000 rows",
      fn: () => streamToString(jsxToStream(<AsyncTable />)),
    },
    {
      name: "string: override, 1,000 rows",
      fn: () => jsxToString.call(createOverrideContext(), <Table />),
    },
    {
      name: "string: async iterable, 1,000 rows",
      fn: () => jsxToString(<AsyncIterableTable />),
    },
    {
      name: "stream: async iterable, 1,000 rows",
      fn: () => streamToString(jsxToStream(<AsyncIterableTable />)),
    },
  ],
  process.argv.slice(2),
);
