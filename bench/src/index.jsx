import { isJsxNode, jsxToStream, jsxToString } from "jsx-async-runtime";
import { run } from "./harness.js";
import { Layout } from "./layout.js";
import { AccountPage, createAccountContext, ORDER_COUNT } from "./pages/account.js";
import { Article } from "./pages/article.js";
import { COMMENT_COUNT, CommentThread } from "./pages/comment-thread.js";
import { Dashboard } from "./pages/dashboard.js";
import { PRODUCT_COUNT, ProductGrid } from "./pages/product-grid.js";
import { SettingsForm } from "./pages/settings-form.js";
import { cx } from "./cx.js";

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

function Row({ row }) {
  return (
    <tr id={`row-${row.id}`} class={cx("row", { active: row.active })} data-id={row.id}>
      <td>{row.id}</td>
      <td>{row.name}</td>
      <td style={row.active ? "text-align: right; color: green" : "text-align: right"}>
        {row.price}
      </td>
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

// Iterator helpers instead of an array, e.g. `map.values().map(...)`.
function IteratorTable() {
  return (
    <Layout title="Products">
      <table>
        <tbody>
          {rows.values().map((row) => (
            <Row row={row} />
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

// A small HTML fragment without a layout, like the response to an htmx or fetch request,
// so the per-render overhead dominates.
const searchHits = rows.slice(0, 10);

function SearchResults() {
  return (
    <tbody id="results" hx-swap-oob="true">
      {searchHits.map((row) => (
        <Row row={row} />
      ))}
    </tbody>
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
    { name: "string: iterator, 1,000 rows", fn: () => jsxToString(<IteratorTable />) },
    // Typical pages, see ./pages.
    { name: "string: partial, 10 rows", fn: () => jsxToString(<SearchResults />) },
    {
      name: `string: product grid, ${PRODUCT_COUNT} cards`,
      fn: () => jsxToString(<ProductGrid />),
    },
    { name: "string: article with CMS html", fn: () => jsxToString(<Article />) },
    {
      name: `string: comment thread, ${COMMENT_COUNT} comments`,
      fn: () => jsxToString(<CommentThread />),
    },
    { name: "string: settings form", fn: () => jsxToString(<SettingsForm />) },
    {
      name: `string: this context, ${ORDER_COUNT} orders`,
      fn: () => jsxToString.call(createAccountContext(), <AccountPage />),
    },
    { name: "string: dashboard, parallel promises", fn: () => jsxToString(<Dashboard />) },
    {
      name: "stream: dashboard, parallel promises",
      fn: () => streamToString(jsxToStream(<Dashboard />)),
    },
  ],
  process.argv.slice(2),
);
