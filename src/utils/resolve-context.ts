/**
 * Returns the context for a render: the given `this`, or a new empty object.
 *
 * Calling `method` on the module (`import * as r` then `r.jsxToString(...)`) passes the module
 * as `this`: the read-only module namespace, or with CommonJS interop (e.g. TypeScript's
 * `esModuleInterop`, Babel or esbuild) a plain copy of it, which every render would share.
 * Neither counts as a context. The namespace check also covers a second copy of this package.
 * The interop helpers set `default` of the copy to the namespace itself, which is how a copy is
 * recognized, so a context spread from the module (e.g. `{ ...runtime, user }`) is kept.
 */
export function resolveContext(thisArg: any, name: string, method: Function): any {
  return thisArg == null || isNamespace(thisArg) || isNamespaceCopy(thisArg, name, method)
    ? {}
    : thisArg;
}

function isNamespace(value: any): boolean {
  return value[Symbol.toStringTag] === "Module";
}

function isNamespaceCopy(value: any, name: string, method: Function): boolean {
  const namespace = value[name] === method ? value.default : undefined;
  return namespace != null && isNamespace(namespace) && namespace[name] === method;
}
