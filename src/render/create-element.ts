import type { Tag } from "../jsx/jsx.types";

export type Attributes = [string, string | undefined][];

export function createElement(element: Tag): {
  tag: string;
  attributes: Attributes;
  children: JSX.Element[];
} {
  return {
    tag: element.tag.toString(),
    attributes: createAttributes(element),
    children: createChildren(element),
  };
}

function createAttributes(element: Tag): Attributes {
  const attributes: Attributes = [];
  for (const [key, value] of Object.entries(element.props)) {
    if (key !== "children") {
      attributes.push([key, value]);
    }
  }
  return attributes;
}

function createChildren(element: Tag): JSX.Element[] {
  if (!element.props.children) {
    return [];
  }
  if (Array.isArray(element.props.children)) {
    return element.props.children as JSX.Element[];
  }
  return [element.props.children as JSX.Element];
}
