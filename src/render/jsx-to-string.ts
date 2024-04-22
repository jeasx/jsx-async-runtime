import { attributesToString } from "./attributes-to-string";
import { createElement } from "./create-element";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export async function jsxToString(jsxElement: JSX.Element): Promise<string> {
  if (jsxElement === null) {
    return "";
  }

  switch (typeof jsxElement) {
    case "string":
      return jsxElement;
    case "bigint":
    case "number":
      return String(jsxElement);
    case "boolean":
    case "function":
    case "symbol":
    case "undefined":
      return "";
  }

  assertSync(jsxElement);

  if (jsxElement.type === "textNode") {
    return jsxElement.text;
  }

  if (typeof jsxElement.tag === "string") {
    const element = createElement(jsxElement);
    if (element.tag === "") {
      const result: string[] = [];
      for (const child of element.children) {
        const str = await jsxToString(child);
        if (str.length > 0) {
          result.push(str);
        }
      }
      return result.join("");
    } else {
      const attributes = attributesToString(element.attributes);
      const separator = attributes.length ? " " : "";

      if (element.children.length === 0 && VOID_TAGS.has(element.tag)) {
        return `<${element.tag}${separator}${attributes}>`;
      }

      const children: string[] = [];
      for (const child of element.children) {
        const str = await jsxToString(child);
        if (str.length > 0) {
          children.push(str);
        }
      }

      return `<${element.tag}${separator}${attributes}>${children.join("")}</${
        element.tag
      }>`;
    }
  } else {
    const jsxElementTag = await jsxElement.tag(jsxElement.props);
    return await jsxToString(jsxElementTag);
  }
}

function assertSync(e: JSX.Element): asserts e is JSX.SyncElement {}
