import { handleRejection } from "./handle-rejection.js";
import { isPromise } from "./is-promise.js";
import { rendersNothing } from "./renders-nothing.js";

// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Joins class names from an array or an object of `name: condition` pairs.
 * Arrays may nest and contain such objects, e.g. `["a", ["b"], { c: cond }]`.
 * Booleans are skipped like in clsx, so `[isActive || "inactive"]` doesn't add a "true" class.
 * Elements and html() markup are skipped too, so their internal keys don't become class names,
 * and so are functions and Symbols, like in attributes.
 * Promises are skipped as well, both as names and as conditions (unlike a promise attribute,
 * they aren't awaited), so `{ active: isActive() }` with an async `isActive` doesn't always add "active".
 */
export function classToString(obj: unknown[] | Record<string, unknown>): string {
  let result = "";
  const add = (name: string) => {
    if (name !== "") {
      result += result !== "" ? ` ${name}` : name;
    }
  };
  const walk = (value: unknown) => {
    if (!value || value === true || rendersNothing(value)) {
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
    } else if (typeof value === "object") {
      if (isPromise(value)) {
        // Never awaited, so a rejection must not crash Node.
        handleRejection(value);
        return;
      }
      const record = value as Record<string, unknown>;
      for (const key in record) {
        if (!hasOwnProperty.call(record, key)) {
          continue;
        }
        const condition = record[key];
        if (isPromise(condition)) {
          handleRejection(condition);
        } else if (condition) {
          add(key);
        }
      }
    } else {
      add(String(value));
    }
  };
  walk(obj);
  return result;
}
