import { attributesToString } from "./attributes-to-string";
import { createElement } from "./create-element";
import { escapeHTML } from "./escape-entities";

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
export async function jsxToString(this: any, jsxElement: JSX.Element): Promise<string> {
  assertSync(jsxElement);

  const $jsxToString = this?.jsxToString ?? jsxToString;
  const $jsxEscapeHTML = this?.jsxEscapeHTML ?? true;

  if (jsxElement === null) {
    return "";
  }

  switch (typeof jsxElement) {
    case "string":
      return $jsxEscapeHTML ? escapeHTML(jsxElement) : jsxElement;
    case "bigint":
    case "number":
      return String(jsxElement);
    case "boolean":
    case "function":
    case "symbol":
    case "undefined":
      return "";
  }

  if ("html" in jsxElement) {
    return jsxElement.html;
  }

  if (jsxElement.type === "textNode") {
    return $jsxEscapeHTML ? escapeHTML(jsxElement.text) : jsxElement.text;
  }

  if (typeof jsxElement.tag === "string") {
    const element = createElement(jsxElement);
    if (element.tag === "") {
      const result: string[] = [];
      for (const child of element.children) {
        const str = await $jsxToString.call(this, child);
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

      const result: string[] = [];
      for (const child of element.children) {
        const str = await $jsxToString.call(this, child);
        if (str.length > 0) {
          result.push(str);
        }
      }

      return `<${element.tag}${separator}${attributes}>${result.join("")}</${element.tag}>`;
    }
  }

  if (typeof jsxElement.tag === "function") {
    const jsxElementTag = await jsxElement.tag.call(this, jsxElement.props);
    return await $jsxToString.call(this, jsxElementTag);
  }

  return "";
}

function assertSync(_e: JSX.Element): asserts _e is JSX.SyncElement {}
