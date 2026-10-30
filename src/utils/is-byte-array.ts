/**
 * Checks for bytes, e.g. a `Buffer` from `readFile()` or a chunk of a `fetch()` body.
 * Bytes are iterable, but render as UTF-8 text instead of a list of numbers.
 */
export function isByteArray(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}
