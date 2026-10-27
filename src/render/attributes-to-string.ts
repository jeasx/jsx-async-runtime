import { createNameValidator } from "./create-name-validator.js";
import { escapeHTML } from "./escape-entities.js";

// An attribute name must not be empty and
// must not contain characters that break the name.
const isValidAttributeName = createNameValidator(/^[^\s"'<>/=&\x00-\x1f\x7f-\x9f]+$/);

export function attributesToString(props: Record<string, unknown>): string {
  let result = "";
  for (const key in props) {
    if (key === "children" || key === "key" || !isValidAttributeName(key)) {
      continue;
    }
    const str = attributeToString(key, props[key]);
    if (str !== "") {
      result += result !== "" ? ` ${str}` : str;
    }
  }
  return result;
}

function attributeToString(key: string, value: any): string {
  if (typeof value === "string") {
    return `${key}="${escapeHTML(value)}"`;
  }
  if (value === true) {
    return key;
  }
  if (
    value === false ||
    value === null ||
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    return "";
  }
  if (typeof value === "object") {
    if (key === "style") {
      const styles = styleToString(value);
      return styles && `style="${escapeHTML(styles)}"`;
    }
    if (key === "class") {
      const classes = classToString(value);
      return classes && `class="${escapeHTML(classes)}"`;
    }
    const prototype = Object.getPrototypeOf(value);
    if (!prototype || prototype === Object.prototype || Array.isArray(value)) {
      return `${key}="${escapeHTML(JSON.stringify(value, valueToStringTransformer))}"`;
    }
  }
  return `${key}="${escapeHTML(String(value))}"`;
}

function valueToStringTransformer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? String(value) : value;
}

function styleToString(obj: Record<string, unknown>): string {
  let result = "";
  let separator = "";
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined || value === false) {
      continue;
    }
    result += `${separator}${key}: ${value}`;
    separator = "; ";
  }
  return result;
}

/**
 * Joins class names from an array or an object of `name: condition` pairs.
 * Arrays may nest and contain such objects, e.g. `["a", ["b"], { c: cond }]`.
 */
function classToString(obj: unknown[] | Record<string, unknown>): string {
  let result = "";
  const add = (name: string) => {
    if (name !== "") {
      result += result !== "" ? ` ${name}` : name;
    }
  };
  const walk = (value: unknown) => {
    if (!value) {
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
    } else if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      for (const key in record) {
        if (record[key]) {
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
