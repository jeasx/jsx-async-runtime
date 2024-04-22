import { renderToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";

export default async function test(name, actual, expected) {
  try {
    assert.strictEqual(await renderToString(actual), expected);
    console.info("✅", name);
  } catch (e) {
    console.info("❌", name, "💥", e);
    process.exit(1);
  }
}
