import { isJsxNode } from "../jsx/is-jsx-node.js";
import { handleRejection } from "./handle-rejection.js";
import { isPromise } from "./is-promise.js";

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
    if (
      value === null ||
      value === undefined ||
      value === false ||
      value === "" ||
      isJsxNode(value)
    ) {
      continue;
    }
    if (isPromise(value)) {
      // Never awaited, so a rejection must not crash Node.
      handleRejection(value);
      continue;
    }
    // Like attributes, functions and Symbols render nothing (a Symbol would throw below).
    // Objects without their own string form, e.g. plain objects and arrays, are skipped too.
    if (
      typeof value === "function" ||
      typeof value === "symbol" ||
      (typeof value === "object" && !hasOwnStringForm(value))
    ) {
      continue;
    }
    result += `${separator}${key}: ${value}`;
    separator = "; ";
  }
  return result;
}

/**
 * Checks for objects with their own `toString`, e.g. a `URL`, like children do.
 * Arrays don't count: "a,b" is never a useful CSS value.
 */
function hasOwnStringForm(value: object): boolean {
  const toString = (value as { toString?: unknown }).toString;
  return (
    !Array.isArray(value) &&
    typeof toString === "function" &&
    toString !== Object.prototype.toString
  );
}
