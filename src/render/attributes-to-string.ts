import { escapeHTML } from "./escape-entities.js";
import { createNameValidator } from "./name-validator.js";

// An attribute name must not be empty and
// must not contain characters that break the name.
// eslint-disable-next-line no-control-regex
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

function classToString(obj: unknown[] | Record<string, unknown>): string {
  let result = "";
  let separator = "";
  if (Array.isArray(obj)) {
    for (const value of obj) {
      if (value) {
        result += `${separator}${value}`;
        separator = " ";
      }
    }
  } else {
    for (const key in obj) {
      if (obj[key]) {
        result += `${separator}${key}`;
        separator = " ";
      }
    }
  }
  return result;
}
