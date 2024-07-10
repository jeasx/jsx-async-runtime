/**
 * Escapes special HTML entities in a given input string.
 *
 * @param {string} input - The input string to escape.
 * @return {string} The input string with special HTML entities escaped.
 */
export function escapeEntities(input: string) {
  return typeof input === "string"
    ? input.replace(ESCAPE, (match) => ENTITIES[match] || match)
    : input;
}

const ENTITIES: { [k: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const ESCAPE = new RegExp(`[${Object.keys(ENTITIES).join("")}]`, "g");
