export function createElement(
  tag: string | ((props: any) => JSX.Element) | ((props: any) => Promise<JSX.Element>),
  props?: {
    [k: string]: any;
    children?: JSX.Children;
  },
  ...children: Array<JSX.Children>
): JSX.Element {
  // Copy props, so the caller's object is never changed.
  return _createElement(tag, { ...props }, children);
}

/**
 * Creates the element and changes the given props in place.
 * jsx() passes props directly, since compiled JSX always creates a fresh object.
 */
function _createElement(
  tag: Parameters<typeof createElement>[0],
  props: NonNullable<Parameters<typeof createElement>[1]>,
  children: Array<JSX.Children>,
): JSX.Element {
  if ("key" in props) {
    delete props["key"]; // key is not a prop (like React)
  }

  const finalChildren: JSX.Element[] = [];

  for (const child of children) {
    mapChildren(child, finalChildren);
  }

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

export function jsx(
  tag: string | ((props: any) => JSX.Element) | ((props: any) => Promise<JSX.Element>),
  props?: {
    [k: string]: any;
    children?: JSX.Children;
  },
  _key?: unknown,
): JSX.Element {
  return _createElement(tag, props ?? {}, []);
}

export const jsxs = jsx;
export const _jsx = jsx;
export const _jsxs = jsx;

export const Fragment = "";
export const _Fragment = Fragment;
