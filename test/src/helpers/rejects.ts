import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { strict as assert } from "node:assert";
import { delay } from "./delay.js";
import { streamToChunks } from "./stream-to-chunks.js";

// Takes a factory, because promise children start when the JSX is created.
export async function rejects(
  createJsx: () => JSX.Element | PromiseLike<JSX.Element>,
  message: string,
) {
  await assert.rejects(async () => jsxToString.call({}, createJsx()), { message });
  await assert.rejects(streamToChunks(jsxToStream.call({}, createJsx())), { message });
  // Give rejections that nobody handled the chance to fail the test.
  await delay(40);
}
