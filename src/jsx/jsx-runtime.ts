import { handleRejection } from "../utils/handle-rejection.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isIterable } from "../utils/is-iterable.js";
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
    // A single child is passed as compiled JSX passes it, so a render prop stays a function.
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
  return { [JSX_NODE_MARKER]: true, html: markup } as unknown as JSX.Element;
}

/**
 * Creates the element and changes the given props in place,
 * since compiled JSX always creates a fresh object.
 */
export function jsx(tag: Tag, props?: Props, _key?: unknown): JSX.Element {
  props ??= {};

  // Children are always an array, except a single function child (a render prop),
  // which is passed as is, so the component can call it as its type says.
  if (typeof props.children !== "function") {
    const $children: Child[] = [];
    if (props.children != null) {
      mapChildren(props.children, $children);
    }
    props.children = $children;
  }

  // Promise props (component props and attributes) are only awaited
  // once earlier siblings have rendered, so they may reject before that.
  // Children were already handled by mapChildren().
  for (const key in props) {
    if (key !== "children") {
      handleRejection(props[key]);
    }
  }

  // The cast pairs the runtime marker with the type-only marker in jsx.types.ts.
  return {
    [JSX_NODE_MARKER]: true,
    type: "tag",
    tag,
    props,
  } as unknown as JSX.Element;
}

function mapChildren(children: Child | Child[], accumulator: Child[]): void {
  switch (typeof children) {
    case "string":
    case "number":
    case "bigint":
    // Functions are kept for components; tags render them as nothing.
    case "function":
      accumulator.push(children);
      break;
    case "object":
      // Flatten arrays and other iterables (e.g. a Set or map.values()) into the children.
      // Bytes stay one child, so they render as text.
      if (Array.isArray(children) || (isIterable(children) && !isByteArray(children))) {
        for (const child of children) {
          mapChildren(child, accumulator);
        }
      } else if (children != null) {
        handleRejection(children);
        accumulator.push(children);
      }
      break;
  }
}

export const jsxs = jsx;
export const _jsx = jsx;
export const _jsxs = jsx;

export const Fragment = "";
export const _Fragment = Fragment;
