import type { Writer } from "./writer.js";

/**
 * The writer of the stream that a context is rendered to, set by `jsxToStream` while rendering.
 * A nested `jsxToString` call with the same context (e.g. from a `this.jsxToString` override
 * or a component) uses it to stop when the stream reader cancels, like the stream itself does.
 * Keyed by context, so streams rendered at the same time need their own context objects.
 */
export const streamWriters = new WeakMap<object, Writer>();
