import { JSX_NODE_MARKER } from "../jsx/jsx-node-marker.js";
import type { Html, Tag } from "../jsx/jsx.types.js";

/**
 * Checks for nodes created by JSX, createElement() or html(), and copies of them.
 * These are the objects the runtime renders as markup. Look-alike objects
 * (e.g. `{ "type": "tag", "props": {} }` from JSON.parse()) lack the Symbol marker and don't count.
 *
 * As a type guard, it lets a `this.jsxToString` override read the tag in TypeScript:
 * `if (isJsxNode(element) && element.tag === "script")`. Raw markup has no tag.
 */
export function isJsxNode(value: unknown): value is Tag | Html {
  return (
    value !== null &&
    typeof value === "object" &&
    (value as Record<symbol, unknown>)[JSX_NODE_MARKER] === true
  );
}
