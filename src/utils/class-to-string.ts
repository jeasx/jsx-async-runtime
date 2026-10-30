import { decodeBytes } from "./decode-bytes.js";
import { handleRejection } from "./handle-rejection.js";
import { isByteArray } from "./is-byte-array.js";
import { isIterable } from "./is-iterable.js";
import { isPromise } from "./is-promise.js";
import { rendersNothing } from "./renders-nothing.js";
import { hasOwnStringForm, toText } from "./to-text.js";

// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Joins class names from an array or an object of `name: condition` pairs.
 * Arrays may nest and contain such objects, e.g. `["a", ["b"], { c: cond }]`.
 * Other iterables (e.g. a `Set`) are read like arrays, and a `Map` like an object.
 * Booleans are skipped like in clsx, so `[isActive || "inactive"]` doesn't add a "true" class.
 * Elements and html() markup are skipped too, so their internal keys don't become class names,
 * and so are functions and Symbols, like in attributes.
 * Promises are skipped as well, both as names and as conditions (unlike a promise attribute,
 * they aren't awaited), so `{ active: isActive() }` with an async `isActive` doesn't always add "active".
 */
export function classToString(obj: unknown[] | Record<string, unknown>): string {
  return addClasses("", obj);
}

// Module-level functions that pass the result along instead of closures, since this runs
// for every `class` array and object: no closures are created per call.

/** Returns `result` with the class names in `value` added. */
function addClasses(result: string, value: unknown): string {
  if (!value || value === true || rendersNothing(value)) {
    return result;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      result = addClasses(result, item);
    }
    return result;
  }
  if (typeof value !== "object") {
    return addName(result, String(value));
  }
  if (isPromise(value)) {
    // Never awaited, so a rejection must not crash Node.
    handleRejection(value);
    return result;
  }
  // Objects with their own string form (e.g. a `URL`) and bytes add it as a name, like
  // the `class` attribute itself. Other objects are read as `name: condition` pairs.
  if (hasOwnStringForm(value)) {
    return addName(result, isByteArray(value) ? decodeBytes(value) : toText(value)!);
  }
  // Plain objects (the common case) skip the checks for Maps and iterables.
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    // A Map holds `name: condition` pairs, like an object.
    if (value instanceof Map) {
      for (const [name, condition] of value) {
        result = addIf(result, name, condition);
      }
      return result;
    }
    // Other iterables (e.g. a `Set` or a generator) are read like arrays.
    if (isIterable(value)) {
      for (const item of value) {
        result = addClasses(result, item);
      }
      return result;
    }
  }
  const record = value as Record<string, unknown>;
  for (const key in record) {
    if (hasOwnProperty.call(record, key)) {
      result = addIf(result, key, record[key]);
    }
  }
  return result;
}

/** Adds `name` when `condition` is truthy. Promise conditions are skipped. */
function addIf(result: string, name: unknown, condition: unknown): string {
  if (isPromise(condition)) {
    handleRejection(condition);
    return result;
  }
  return condition && typeof name === "string" ? addName(result, name) : result;
}

function addName(result: string, name: string): string {
  if (name === "") {
    return result;
  }
  return result !== "" ? `${result} ${name}` : name;
}
