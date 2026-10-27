/**
 * Checks for iterables, e.g. a `Set`, `map.values()` or the result of a generator
 * or an iterator helper like `iterator.map()`. Strings are iterable too,
 * so callers must handle them first.
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  return typeof (value as Iterable<unknown> | null)?.[Symbol.iterator] === "function";
}
