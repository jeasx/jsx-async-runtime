export function createElement(
  tag: string | ((props: any) => JSX.Element) | ((props: any) => Promise<JSX.Element>),
  props?: {
    [k: string]: any;
    children?: JSX.Children;
  },
  ...children: Array<JSX.Children>
): JSX.Element {
  props ??= {};
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
      accumulator.push({ type: "textNode", text: children });
      break;
    case "number":
    case "bigint":
      accumulator.push({ type: "textNode", text: children.toString() });
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
  return createElement(tag, props);
}

export const jsxs = jsx;
export const _jsx = jsx;
export const _jsxs = jsx;

export const Fragment = "";
export const _Fragment = Fragment;
