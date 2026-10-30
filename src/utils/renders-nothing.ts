import { isJsxNode } from "../jsx/is-jsx-node.js";
import type { ElementNode, Html } from "../jsx/jsx.types.js";

/**
 * Checks for values that render nothing as attributes:
 * `null`, `undefined`, `false`, functions and Symbols (instead of their source or `Symbol(...)`),
 * and elements and html() markup (instead of their internal structure).
 * `true` isn't included, since it renders as a boolean attribute.
 */
export function rendersNothing(
  value: unknown,
): value is null | undefined | false | Function | symbol | ElementNode | Html {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    isJsxNode(value)
  );
}
