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

/**
 * Renders a JSX element to a string representation.
 *
 * @param {any} this - The (optional) 'this' context of the function.
 * @param {JSX.Element} jsxElement - The JSX element to render.
 * @return {Promise<string>} The string representation of the rendered JSX element.
 */
export async function jsxToString(
  this: any,
  jsxElement: JSX.Element
): Promise<string> {
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
        const str = await jsxToString.call(this, child);
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
        const str = await jsxToString.call(this, child);
        if (str.length > 0) {
          children.push(str);
        }
      }

      return `<${element.tag}${separator}${attributes}>${children.join("")}</${
        element.tag
      }>`;
    }
  }

  if (typeof jsxElement.tag === "function") {
    const jsxElementTag = await jsxElement.tag.call(this, jsxElement.props);
    return await jsxToString.call(this, jsxElementTag);
  }

  return "";
}

function assertSync(e: JSX.Element): asserts e is JSX.SyncElement {}
