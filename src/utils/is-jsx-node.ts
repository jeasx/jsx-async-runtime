import { JSX_NODE_MARKER } from "../jsx/jsx-node-marker.js";

/**
 * Checks for nodes created by jsx(), createElement() or html().
 * Look-alike objects (e.g. from JSON.parse()) lack the Symbol marker and don't count.
 */
export function isJsxNode(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[JSX_NODE_MARKER] === true
  );
}
