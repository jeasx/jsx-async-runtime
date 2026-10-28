import { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs } from "./jsx-runtime.js";

export function jsxDEV(
  tag: Parameters<typeof jsx>[0],
  props?: Parameters<typeof jsx>[1],
  _key?: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): JSX.Element {
  return jsx(tag, props);
}

export { Fragment, _Fragment, _jsx, _jsxs, createElement, jsx, jsxs };
