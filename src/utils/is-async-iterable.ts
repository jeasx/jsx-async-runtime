/**
 * Checks for async iterables, e.g. the result of an async generator or a `ReadableStream`.
 */
export function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return typeof (value as AsyncIterable<unknown> | null)?.[Symbol.asyncIterator] === "function";
}
