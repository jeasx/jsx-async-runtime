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

export async function jsxToString(
  jsxElement: JSX.Element,
  options?: {
    indent?: number;
    currentIndent?: number;
  },
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

  const { currentIndent = 0, indent = 0 } = options ?? {};
  const padding = " ".repeat(currentIndent);

  if (jsxElement.type === "textNode") {
    return `${padding}${jsxElement.text}`;
  }

  if (typeof jsxElement.tag === "string") {
    const element = createElement(jsxElement);
    if (element.tag === "") {
      const result: string[] = [];
      for (const child of element.children) {
        const str = await jsxToString(child, {
          indent,
          currentIndent,
        });
        if (str.length > 0) {
          result.push(str);
        }
      }
      return result.join("\n");
    } else {
      const attributes = attributesToString(element.attributes);
      const separator = attributes.length ? " " : "";

      if (element.children.length === 0 && VOID_TAGS.has(element.tag)) {
        return `${padding}<${element.tag}${separator}${attributes}>`;
      }

      const inlineTag =
        element.children.length === 0 || element.children.every(isTextNode);

      const startTag = `${padding}<${element.tag}${separator}${attributes}>`;
      const endTag = `${inlineTag ? "" : padding}</${element.tag}>`;
      const children: string[] = [];

      for (const child of element.children) {
        const str = await jsxToString(child, {
          indent: inlineTag ? 0 : indent,
          currentIndent: inlineTag ? 0 : currentIndent + indent,
        });
        if (str.length > 0) {
          children.push(str);
        }
      }

      if (inlineTag) {
        return `${startTag}${children.join("")}${endTag}`;
      }
      return `${startTag}\n${children.join("\n")}\n${endTag}`;
    }
  } else {
    const jsxElementTag = await jsxElement.tag(jsxElement.props);
    return await jsxToString(jsxElementTag, { indent, currentIndent });
  }
}

function assertSync(e: JSX.Element): asserts e is JSX.SyncElement {}

function isTextNode(e: JSX.Element) {
  return (
    e != null && typeof e === "object" && "type" in e && e.type === "textNode"
  );
}
