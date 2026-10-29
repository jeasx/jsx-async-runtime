import { strict as assert } from "node:assert";
import { delay } from "./delay.js";
import { renderers } from "./renderers.js";

// Takes a factory, because promise children start when the JSX is created.
export async function rejects(
  createJsx: () => JSX.Element | PromiseLike<JSX.Element>,
  message: string,
) {
  for (const render of renderers) {
    await assert.rejects(async () => render(createJsx()), { message });
  }
  // Give rejections that nobody handled the chance to fail the test.
  await delay(40);
}
