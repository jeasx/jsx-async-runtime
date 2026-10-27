import { isIterable } from "../utils/iterables.js";
import { handleRejection } from "../utils/promises.js";

type Tag = string | ((props: any) => JSX.Element) | ((props: any) => Promise<JSX.Element>);

type Props = {
  [k: string]: any;
  children?: JSX.Children;
};

export function createElement(
  tag: Tag,
  props?: Props,
  ...children: Array<JSX.Children>
): JSX.Element {
  // Copy props, so the caller's object is never changed.
  const $props = { ...props };
  if (children.length) {
    // Positional children come before props.children.
    $props.children = $props.children != null ? [...children, $props.children] : children;
  }
  return jsx(tag, $props);
}

/**
 * Creates the element and changes the given props in place,
 * since compiled JSX always creates a fresh object.
 */
export function jsx(tag: Tag, props?: Props, _key?: unknown): JSX.Element {
  props ??= {};

  const $children: JSX.Element[] = [];
  if (props.children != null) {
    mapChildren(props.children, $children);
  }
  props.children = $children;

  if (typeof tag === "function") {
    // A component awaits its promise props only once earlier siblings have rendered.
    for (const key in props) {
      handleRejection(props[key]);
    }
  }

  return {
    type: "tag",
    tag,
    props,
  } as JSX.Element;
}

function mapChildren(children: JSX.Children, accumulator: JSX.Element[]): void {
  switch (typeof children) {
    case "string":
    case "number":
    case "bigint":
      accumulator.push(children);
      break;
    case "object":
      // Flatten arrays and other iterables (e.g. a Set or map.values()) into the children.
      if (Array.isArray(children) || isIterable(children)) {
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
