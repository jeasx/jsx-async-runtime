import { isJsxNode } from "../jsx/is-jsx-node.js";
import type { ElementNode, Html } from "../jsx/jsx.types.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { decodeBytes } from "../utils/decode-bytes.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isPromise } from "../utils/is-promise.js";
import { toText } from "../utils/to-text.js";
import { escapeHTML } from "./escape-entities.js";

// Skips keys inherited from a polluted `Object.prototype` (e.g. by a naive deep merge
// of a request body elsewhere in the app), so they can't add attributes like `onmouseover`.
// A module-local `hasOwnProperty.call()` keeps V8's fast path for `for...in` loops,
// which `Object.hasOwn()` or an imported helper lose (about 7% slower in the benchmark).
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Renders the attributes of a tag. Returns a promise only when an attribute value is a promise:
 * then all promise values are awaited in parallel and rendered like their resolved values.
 */
export function attributesToString(props: Record<string, unknown>): string | Promise<string> {
  let result = "";
  for (const key in props) {
    if (!hasOwnProperty.call(props, key) || !isAttribute(key)) {
      continue;
    }
    const value = props[key];
    if (isPromise(value)) {
      return renderRestAsync(result, props, key);
    }
    const str = attributeToString(key, value);
    if (str !== "") {
      result += result !== "" ? ` ${str}` : str;
    }
  }
  return result;
}

/**
 * Renders the attributes from `from` (the first promise) on, once their promises resolved,
 * after the ones already rendered, which are kept instead of rendered again. A separate
 * function, so the hot loop above captures no variables in a closure (V8 keeps them in
 * a slower context).
 */
async function renderRestAsync(
  rendered: string,
  props: Record<string, unknown>,
  from: string,
): Promise<string> {
  const rest = attributesToString(await resolveAttributes(props, from)) as string;
  return rendered !== "" && rest !== "" ? `${rendered} ${rest}` : rendered + rest;
}

// An attribute name must not be empty and
// must not contain characters that break the name.
const isValidAttributeName = createNameValidator(/^[^\s"'<>/=&\x00-\x1f\x7f-\x9f]+$/);

// Props that are never rendered (children, key, invalid names) are skipped, and never awaited.
function isAttribute(key: string): boolean {
  return key !== "children" && key !== "key" && isValidAttributeName(key);
}

/**
 * Returns a copy of the attributes from `from` on, with all promise values awaited.
 * Rejects with the first error, like a promise child does.
 */
async function resolveAttributes(
  props: Record<string, unknown>,
  from: string,
): Promise<Record<string, unknown>> {
  // Without a prototype, an own `__proto__` key (e.g. from spread JSON) is set as an attribute
  // like in the sync path, instead of calling the prototype setter and getting lost.
  const resolved: Record<string, unknown> = Object.create(null);
  const pending: Promise<void>[] = [];
  let started = false;
  for (const key in props) {
    if (!hasOwnProperty.call(props, key) || !isAttribute(key)) {
      continue;
    }
    if (!started) {
      if (key !== from) {
        continue;
      }
      started = true;
    }
    const value = props[key];
    // Assigned in prop order, so attributes render in the order they were written.
    resolved[key] = value;
    if (isPromise(value)) {
      pending.push(
        Promise.resolve(value).then(($value) => {
          resolved[key] = $value;
        }),
      );
    }
  }
  await Promise.all(pending);
  return resolved;
}

function attributeToString(key: string, value: unknown): string {
  if (typeof value === "string") {
    return `${key}="${escapeHTML(value)}"`;
  }
  if (value === true) {
    return key;
  }
  if (rendersNothing(value)) {
    return "";
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (!prototype || prototype === Object.prototype || Array.isArray(value)) {
      const json = JSON.stringify(value, valueToStringTransformer);
      // A `toJSON()` that returns `undefined` (or a function) gives no JSON, so render nothing
      // instead of `key="undefined"`.
      return json === undefined ? "" : `${key}="${escapeHTML(json)}"`;
    }
    // Bytes render as UTF-8 text, like they do as children, instead of a list of numbers.
    if (isByteArray(value)) {
      return `${key}="${escapeHTML(decodeBytes(value))}"`;
    }
  }
  // Like children, only objects with their own string form (e.g. `Date`, `URL`) render it.
  // Others (e.g. a `Map`, a `Set` or a class instance without `toString`) render nothing
  // instead of `[object Map]`.
  const text = toText(value);
  return text === undefined ? "" : `${key}="${escapeHTML(text)}"`;
}

/**
 * Checks for values that render nothing as attributes.
 */
function rendersNothing(
  value: unknown,
): value is null | undefined | false | Function | symbol | ElementNode | Html {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    isJsxNode(value)
  );
}

function valueToStringTransformer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return String(value);
  }
  // Nested elements are left out like functions: dropped from objects, `null` in arrays.
  return isJsxNode(value) ? undefined : value;
}
