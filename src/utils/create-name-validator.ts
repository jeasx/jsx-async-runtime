/**
 * Creates a function that checks names (tags, attributes) against a pattern.
 * Valid names are cached, because the same names repeat on every render
 * and a Set lookup is faster than running the regex.
 */
export function createNameValidator(pattern: RegExp): (name: string) => boolean {
  const validNames = new Set<string>();
  return (name) => {
    if (validNames.has(name)) {
      return true;
    }
    if (!pattern.test(name)) {
      return false;
    }
    // Limit the cache (count and name length),
    // so names from untrusted input can't grow it without bound.
    if (name.length <= 128 && validNames.size < 1024) {
      validNames.add(name);
    }
    return true;
  };
}
