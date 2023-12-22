import type { Attributes } from "./create-element";

export function attributesToString(attributes: Attributes): string {
  const results: string[] = [];
  for (const attribute of attributes) {
    const html = attributeToString(attribute);
    if (html.length > 0) {
      results.push(html);
    }
  }
  return results.join(" ");
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
        return `style="${escape(styles.join("; "))}"`;
      case "class":
        const classes = Object.entries(value)
          .filter(([k, v]) => v)
          .map(([k, v]) => k);
        return `class="${escape(classes.join(" "))}"`;
      default:
        return `${key}="${escape(JSON.stringify(value))}"`;
    }
  }
  return `${key}="${escape(value.toString())}"`;
}

function escape(str: string) {
  return str.replaceAll('"', "&quot;");
}