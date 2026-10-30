import { isJsxNode } from "../jsx/is-jsx-node.js";
import { createElement, html } from "../jsx/jsx-runtime.js";
import { escapeEntities } from "../render/escape-entities.js";

/**
 * Returns the context for a render: the given `this`, or a new empty object.
 *
 * Calling `method` on the module (`import * as r` then `r.jsxToString(...)`) passes the module
 * as `this`: the read-only module namespace, or with CommonJS interop (e.g. TypeScript's
 * `esModuleInterop`) a plain copy of it, which every render would share. Neither counts as a
 * context. The namespace check also covers a second copy of this package. A copy is recognized
 * by holding `method` under `name` and the other function exports, so a context that holds
 * only some of them (e.g. `{ jsxToString, isJsxNode, user }`, so components can call
 * `this.jsxToString()`) is kept.
 */
export function resolveContext(thisArg: any, name: string, method: Function): any {
  return thisArg == null ||
    thisArg[Symbol.toStringTag] === "Module" ||
    (thisArg[name] === method &&
      thisArg.isJsxNode === isJsxNode &&
      thisArg.createElement === createElement &&
      thisArg.html === html &&
      thisArg.escapeEntities === escapeEntities)
    ? {}
    : thisArg;
}
