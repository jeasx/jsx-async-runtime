import { escapeHTML } from "./escape-entities.js";

export function attributesToString(props: Record<string, unknown>): string {
  let result = "";
  for (const key in props) {
    if (key === "children" || !isValidAttributeName(key)) {
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
      return `${key}="${escapeHTML(JSON.stringify(value))}"`;
    }
  }
  return `${key}="${escapeHTML(String(value))}"`;
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

// Characters that end or break an HTML attribute name.
// eslint-disable-next-line no-control-regex
const INVALID_ATTRIBUTE_NAME = /[\s"'<>/=&\x00-\x1f\x7f-\x9f]/;

const VALID_ATTRIBUTE_NAMES = new Set<string>();

function isValidAttributeName(key: string): boolean {
  if (VALID_ATTRIBUTE_NAMES.has(key)) {
    return true;
  }
  if (key === "" || INVALID_ATTRIBUTE_NAME.test(key)) {
    return false;
  }
  // Limit the cache (count and key length), so keys from untrusted objects can't grow it without bound
  if (key.length <= 128 && VALID_ATTRIBUTE_NAMES.size < 1024) {
    VALID_ATTRIBUTE_NAMES.add(key);
  }
  return true;
}
