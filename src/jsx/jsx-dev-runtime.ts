import type { JsxProps } from "./jsx.types.js";
import { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs } from "./jsx-runtime.js";

export function jsxDEV(
  tag: JSX.ElementType,
  props?: JsxProps,
  _key?: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): JSX.Element {
  return jsx(tag, props);
}

export { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs };
