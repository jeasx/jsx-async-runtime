import type { Attributes } from "./create-element";

export function attributesToString(attributes: Attributes): string {
  const result: string[] = [];
  for (const attribute of attributes) {
    const str = attributeToString(attribute);
    if (str.length > 0) {
      result.push(str);
    }
  }
  return result.join(" ");
}

function attributeToString([key, value]: [string, any]): string {
  if (value === true) {
    return key;
  }
  if (value === false || value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    switch (key) {
      case "style":
        const styles = Object.entries(value).map(([k, v]) => `${k}: ${v}`);
        return `style="${escapeQuotes(styles.join("; "))}"`;
      case "class":
        const classes = Array.isArray(value)
          ? value.filter((v) => v)
          : Object.entries(value)
              .filter(([_, v]) => v)
              .map(([k]) => k);
        return classes.length > 0
          ? `class="${escapeQuotes(classes.join(" "))}"`
          : "";
      default:
        return `${key}="${escapeQuotes(JSON.stringify(value))}"`;
    }
  }
  return `${key}="${escapeQuotes(value.toString())}"`;
}

function escapeQuotes(str: string): string {
  return str.replaceAll('"', "&quot;");
}
