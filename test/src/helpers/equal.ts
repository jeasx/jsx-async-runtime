import { strict as assert } from "node:assert";
import { renderers, type Renderable } from "./renderers.js";

// Takes the JSX, or a factory for JSX that can be read only once (e.g. with a generator
// or a stream as child), so each render gets its own.
export async function equal(jsx: Renderable | (() => Renderable), str: string) {
  const createJsx = typeof jsx === "function" ? jsx : () => jsx;
  for (const render of renderers) {
    assert.strictEqual(await render(createJsx()), str);
  }
}
