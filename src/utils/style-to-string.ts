// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Serializes a style object into an inline CSS string, e.g.
 * `{ color: "red", "font-size": "12px" }` becomes `color: red; font-size: 12px`.
 * Keys are used as-is (no camelCase conversion).
 * Like in React, empty values are skipped, so `color: ""` doesn't render `color: `.
 */
export function styleToString(obj: Record<string, unknown>): string {
  let result = "";
  let separator = "";
  for (const key in obj) {
    if (!hasOwnProperty.call(obj, key)) {
      continue;
    }
    const value = obj[key];
    if (value === null || value === undefined || value === false || value === "") {
      continue;
    }
    result += `${separator}${key}: ${value}`;
    separator = "; ";
  }
  return result;
}
