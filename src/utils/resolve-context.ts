/**
 * Returns the context for a render: the given `this`, or a new empty object.
 *
 * Calling `method` on the module (`import * as r` then `r.jsxToString(...)`) passes the module
 * as `this`: the read-only module namespace, or with CommonJS interop (e.g. TypeScript's
 * `esModuleInterop`) a plain copy of it, which every render would share. Neither counts as a
 * context. Both hold `method` under `name`; the namespace check also covers a second copy
 * of this package. Otherwise their `jsxToString` export would be taken for an override.
 */
export function resolveContext(thisArg: any, name: string, method: Function): any {
  return thisArg == null || thisArg[name] === method || thisArg[Symbol.toStringTag] === "Module"
    ? {}
    : thisArg;
}
