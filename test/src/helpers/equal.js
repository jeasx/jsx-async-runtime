import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import { streamToChunks } from "./stream-to-chunks.js";

// Takes the JSX, or a factory for JSX that can be read only once (e.g. with a generator
// or a stream as child), so each render gets its own.
export async function equal(jsx, str) {
  const createJsx = typeof jsx === "function" ? jsx : () => jsx;
  assert.strictEqual(await jsxToString.call({}, createJsx()), str);
  assert.strictEqual((await streamToChunks(jsxToStream.call({}, createJsx()))).join(""), str);
}
