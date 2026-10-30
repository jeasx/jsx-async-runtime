// Compiled with `"jsx": "react-jsxdev"` (see tsconfig.jsxdev.json), so the JSX here calls jsxDEV.
// It must not import the main entry, not even through the helpers: the JSX types have to come
// from `jsx-async-runtime/jsx-dev-runtime` alone, or a "Cannot find namespace 'JSX'" goes unnoticed.
import { strict as assert } from "node:assert";
import test from "node:test";

// A specifier TypeScript doesn't follow, so the types of the main entry aren't loaded.
const mainEntry: string = "jsx-async-runtime";
const { jsxToString } = await import(mainEntry);

const Item = ({ label }: { label: string }) => <li>{label}</li>;

async function List({ children }: { children: JSX.Children }) {
  return <ul>{children}</ul>;
}

test("JSX compiled for the dev runtime type-checks and renders", async () => {
  const page: JSX.Element = (
    <>
      <List>
        {["a", "b"].map((label) => (
          <Item key={label} label={label} />
        ))}
      </List>
      <p class="x" id={null}>
        text
      </p>
    </>
  );
  // Neither `key` nor the source info that jsxDEV receives is rendered.
  assert.strictEqual(await jsxToString(page), `<ul><li>a</li><li>b</li></ul><p class="x">text</p>`);
});
