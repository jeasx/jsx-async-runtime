// Module-local, like the other `hasOwnProperty` copies, since this runs for every element.
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Returns the children of an element as passed: none, a single child or an array.
 * Own children only, so `children` from a polluted `Object.prototype` isn't rendered
 * (or walked) in every element without children.
 */
export function getOwnChildren(props: object): unknown {
  return hasOwnProperty.call(props, "children")
    ? (props as { children?: unknown }).children
    : undefined;
}
