import { handleRejection } from "../utils/handle-rejection.js";
import { JSX_NODE_MARKER } from "./jsx-node-marker.js";

type Tag = string | ((props: any) => JSX.Element) | ((props: any) => Promise<JSX.Element>);

// A function child, e.g. a render prop: `<Loader>{(data) => <p>{data}</p>}</Loader>`.
type RenderProp = (...args: any[]) => unknown;
type Child = JSX.Children | RenderProp;

type Props = {
  [k: string]: any;
  children?: Child | Child[];
};

export function createElement(tag: Tag, props?: Props, ...children: Child[]): JSX.Element {
  // Copy props, so the caller's object is never changed.
  const $props = { ...props };
  if (children.length) {
    // Positional children replace props.children, like in React. Compiled JSX
    // calls createElement when `key` comes after a spread, so this keeps
    // `<Row {...node} key={id}>label</Row>` the same as without `key`.
    // A single child is passed as is, like compiled JSX passes it.
    $props.children = children.length === 1 ? children[0] : children;
  }
  return jsx(tag, $props);
}

/**
 * Marks a string as raw markup, which is rendered without escaping,
 * e.g. `{html("<!DOCTYPE html>")}`. Never pass untrusted input.
 * Plain `{ html }` objects (e.g. from JSON.parse()) render nothing.
 */
export function html(markup: string): JSX.Element {
  // The cast pairs the runtime marker with the type-only marker in jsx.types.ts.
  // An own `type` tells raw markup from elements, so an `html` key inherited
  // from a polluted `Object.prototype` can't turn elements into raw markup.
  return { [JSX_NODE_MARKER]: true, type: "html", html: markup } as unknown as JSX.Element;
}

/**
 * Creates the element and keeps the given props object without copying it,
 * since compiled JSX always creates a fresh object.
 */
export function jsx(tag: Tag, props?: Props, _key?: unknown): JSX.Element {
  props ??= {};

  // Children are passed to components as written, like in React and as TypeScript types them:
  // a single child as is (e.g. a string or a render prop), several children as an array,
  // and no `children` prop without children.

  // Promise props (children, component props and attributes) are only awaited
  // once earlier siblings have rendered, so they may reject before that.
  for (const key in props) {
    handleRejection(props[key]);
  }

  // The cast pairs the runtime marker with the type-only marker in jsx.types.ts.
  return {
    [JSX_NODE_MARKER]: true,
    type: "tag",
    tag,
    props,
  } as unknown as JSX.Element;
}

export const jsxs = jsx;
export const _jsx = jsx;
export const _jsxs = jsx;

export const Fragment = "";
export const _Fragment = Fragment;
