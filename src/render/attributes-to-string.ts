import { isJsxNode } from "../jsx/is-jsx-node.js";
import { classToString } from "../utils/class-to-string.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { decodeBytes } from "../utils/decode-bytes.js";
import { hasOwnStringForm } from "../utils/has-own-string-form.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isPromise } from "../utils/is-promise.js";
import { rendersNothing } from "../utils/renders-nothing.js";
import { styleToString } from "../utils/style-to-string.js";
import { escapeHTML } from "./escape-entities.js";

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
      return resolveAttributes(props).then((resolved) => attributesToString(resolved) as string);
    }
    const str = attributeToString(key, value);
    if (str !== "") {
      result += result !== "" ? ` ${str}` : str;
    }
  }
  return result;
}

// Skips keys inherited from a polluted `Object.prototype` (e.g. by a naive deep merge
// of a request body elsewhere in the app), so they can't add attributes like `onmouseover`.
// A module-local `hasOwnProperty.call()` keeps V8's fast path for `for...in` loops,
// which `Object.hasOwn()` or an imported helper lose (about 7% slower in the benchmark).
const hasOwnProperty = Object.prototype.hasOwnProperty;

// An attribute name must not be empty and
// must not contain characters that break the name.
const isValidAttributeName = createNameValidator(/^[^\s"'<>/=&\x00-\x1f\x7f-\x9f]+$/);

// Props that are never rendered (children, key, invalid names) are skipped, and never awaited.
function isAttribute(key: string): boolean {
  return key !== "children" && key !== "key" && isValidAttributeName(key);
}

/**
 * Returns a copy of the attributes with all promise values awaited.
 * Rejects with the first error, like a promise child does.
 */
async function resolveAttributes(props: Record<string, unknown>): Promise<Record<string, unknown>> {
  const resolved: Record<string, unknown> = {};
  const pending: Promise<void>[] = [];
  for (const key in props) {
    if (!hasOwnProperty.call(props, key) || !isAttribute(key)) {
      continue;
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

function attributeToString(key: string, value: any): string {
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
    if (key === "style") {
      // An array isn't a style object, so it renders nothing instead of `0: ...` for each item.
      if (Array.isArray(value)) {
        return "";
      }
      const styles = styleToString(value);
      return styles && `style="${escapeHTML(styles)}"`;
    }
    if (key === "class") {
      const classes = classToString(value);
      return classes && `class="${escapeHTML(classes)}"`;
    }
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
    // Like children, only objects with their own string form (e.g. `Date`, `URL`) render it.
    // Others (e.g. a `Map`, a `Set` or a class instance without `toString`) render nothing
    // instead of `[object Map]`.
    if (!hasOwnStringForm(value)) {
      return "";
    }
  }
  return `${key}="${escapeHTML(String(value))}"`;
}

function valueToStringTransformer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return String(value);
  }
  // Nested elements are left out like functions: dropped from objects, `null` in arrays.
  return isJsxNode(value) ? undefined : value;
}
