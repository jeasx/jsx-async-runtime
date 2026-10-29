/**
 * Checks for objects with their own string form, e.g. `Date`, `URL`, `Error`
 * or a class instance with a `toString` method.
 * Plain objects use the default `toString` (or have none), so they don't count,
 * and render nothing instead of "[object Object]". Arrays count ("a,b"),
 * so callers that don't want that must check for them first.
 */
export function hasOwnStringForm(value: object): boolean {
  const toString = (value as { toString?: unknown }).toString;
  return typeof toString === "function" && toString !== Object.prototype.toString;
}
