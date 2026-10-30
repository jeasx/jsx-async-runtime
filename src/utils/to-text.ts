/**
 * Returns the text form of a value, or `undefined` when it has none: `null`, `undefined`
 * and objects without their own string form (e.g. a plain object, a `Map` or
 * `Object.create(null)`), so they render nothing instead of "[object Object]" or a TypeError.
 * Objects with their own string form (e.g. `Date`, `URL`, `Error` or a class instance with
 * a `toString` method) give it. Arrays count too ("a,b"), so callers that don't want that
 * must check for them first. Booleans give "true" and "false", so callers that render them
 * as nothing must check for them first, too.
 */
export function toText(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (value == null) {
    return undefined;
  }
  if (typeof value === "object") {
    const toString = (value as { toString?: unknown }).toString;
    if (typeof toString !== "function" || toString === Object.prototype.toString) {
      return undefined;
    }
  }
  return String(value);
}
