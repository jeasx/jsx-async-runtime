import type { ElementProps } from "./jsx.types.js";
import { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs } from "./jsx-runtime.js";

export function jsxDEV(
  tag: JSX.ElementType,
  props?: ElementProps,
  _key?: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): JSX.Element {
  return jsx(tag, props);
}

export { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs };
