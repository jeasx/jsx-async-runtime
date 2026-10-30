/**
 * Joins class names like clsx, which apps would use for this: strings, (nested) arrays
 * and objects of `name: condition` pairs. Falsy values are skipped.
 * @param {...any} values
 * @returns {string}
 */
export function cx(...values) {
  let result = "";
  for (const value of values) {
    if (!value) {
      continue;
    }
    let names = "";
    if (typeof value === "string") {
      names = value;
    } else if (Array.isArray(value)) {
      names = cx(...value);
    } else if (typeof value === "object") {
      for (const key in value) {
        if (value[key]) {
          names += names ? ` ${key}` : key;
        }
      }
    }
    if (names) {
      result += result ? ` ${names}` : names;
    }
  }
  return result;
}
