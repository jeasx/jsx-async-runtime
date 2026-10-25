import { escapeHTML } from "./escape-entities.js";

export function attributesToString(props: Record<string, unknown>): string {
  let result = "";
  for (const key in props) {
    if (key === "children") {
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
  if (value === false || value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    if (key === "style") {
      const styles = styleToString(value);
      return styles === "" ? "" : `style="${escapeHTML(styles)}"`;
    }
    if (key === "class") {
      const classes = classToString(value);
      return classes === "" ? "" : `class="${escapeHTML(classes)}"`;
    }
    return `${key}="${escapeHTML(JSON.stringify(value))}"`;
  }
  return `${key}="${escapeHTML(value.toString())}"`;
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
