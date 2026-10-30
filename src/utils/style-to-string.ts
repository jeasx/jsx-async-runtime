import { handleRejection } from "./handle-rejection.js";
import { isPromise } from "./is-promise.js";
import { rendersNothing } from "./renders-nothing.js";
import { toText } from "./to-text.js";

// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Serializes a style object into an inline CSS string, e.g.
 * `{ color: "red", "font-size": "12px" }` becomes `color: red; font-size: 12px`.
 * Keys are used as-is (no camelCase conversion).
 * Like in React, empty values are skipped, so `color: ""` doesn't render `color: `.
 * Elements and html() markup are skipped too, instead of rendering `[object Object]`,
 * and so are functions, Symbols and objects without their own `toString` (e.g. plain objects).
 * Promises are skipped as well (unlike a promise attribute, they aren't awaited),
 * instead of rendering `[object Promise]`.
 */
export function styleToString(obj: Record<string, unknown>): string {
  let result = "";
  let separator = "";
  for (const key in obj) {
    if (!hasOwnProperty.call(obj, key)) {
      continue;
    }
    const value = obj[key];
    // Like attributes, so e.g. a Symbol is skipped instead of throwing below.
    if (value === "" || rendersNothing(value)) {
      continue;
    }
    if (isPromise(value)) {
      // Never awaited, so a rejection must not crash Node.
      handleRejection(value);
      continue;
    }
    // Arrays are skipped: "a,b" is never a useful CSS value.
    if (Array.isArray(value)) {
      continue;
    }
    // Objects without their own string form, e.g. plain objects, are skipped too.
    const text = toText(value);
    if (text === undefined) {
      continue;
    }
    result += `${separator}${key}: ${text}`;
    separator = "; ";
  }
  return result;
}
