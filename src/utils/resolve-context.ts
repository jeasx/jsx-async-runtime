/**
 * Returns the context for a render: the given `this`, or a new empty object.
 * A module namespace counts as no context: `import * as r` then `r.jsxToString(...)`
 * passes it as `this`, but it is read-only and its `jsxToString` export
 * would be taken for an override.
 */
export function resolveContext(thisArg: any): any {
  return thisArg == null || thisArg[Symbol.toStringTag] === "Module" ? {} : thisArg;
}
