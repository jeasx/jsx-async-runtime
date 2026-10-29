// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Joins class names from an array or an object of `name: condition` pairs.
 * Arrays may nest and contain such objects, e.g. `["a", ["b"], { c: cond }]`.
 */
export function classToString(obj: unknown[] | Record<string, unknown>): string {
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
        if (hasOwnProperty.call(record, key) && record[key]) {
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
