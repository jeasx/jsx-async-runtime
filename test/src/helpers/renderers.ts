import { jsxToStream, jsxToString } from "jsx-async-runtime";
import { streamToChunks } from "./stream-to-chunks.js";

export type Renderable =JSX.Element | PromiseLike<JSX.Element>;

// Both renderers, each rendering to a string, so a test can check that they agree.
export const renderers = [
  async (jsx: Renderable) => jsxToString.call({}, jsx),
  async (jsx: Renderable) => (await streamToChunks(jsxToStream.call({}, jsx))).join(""),
];
