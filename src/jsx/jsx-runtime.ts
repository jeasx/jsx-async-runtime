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
  // Copy props without key, so the caller's object is never changed.
  const { key: _key, ...propsWithoutKey } = props ?? {};
  if (children.length) {
    // Positional children come before props.children.
    propsWithoutKey.children =
      propsWithoutKey.children != null ? [...children, propsWithoutKey.children] : children;
  }
  return jsx(tag, propsWithoutKey);
}

/**
 * Creates the element and changes the given props in place,
 * since compiled JSX always creates a fresh object.
 */
export function jsx(tag: Tag, props?: Props, _key?: unknown): JSX.Element {
  props ??= {};

  if ("key" in props) {
    // key is not a prop (like React).
    // Copy instead of delete, because delete makes V8 use slow objects.
    const { key: _key, ...propsWithoutKey } = props;
    props = propsWithoutKey;
  }

  const finalChildren: JSX.Element[] = [];
  if (props.children != null) {
    mapChildren(props.children, finalChildren);
  }
  props.children = finalChildren;

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
      if (Array.isArray(children)) {
        for (const child of children) {
          mapChildren(child, accumulator);
        }
      } else if (children != null) {
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
