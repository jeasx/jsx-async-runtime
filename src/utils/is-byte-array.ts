/**
 * Checks for bytes, e.g. a `Buffer` from `readFile()` or a chunk of a `fetch()` body.
 * Bytes are iterable, but render as UTF-8 text instead of a list of numbers.
 * Checks the type name, so bytes from other realms (e.g. `node:vm`) count too.
 */
export function isByteArray(value: unknown): value is Uint8Array {
  return ArrayBuffer.isView(value) && (value as Uint8Array)[Symbol.toStringTag] === "Uint8Array";
}
