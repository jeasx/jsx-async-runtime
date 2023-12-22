import { attributesToString } from "./attributes-to-string";
import { createElement } from "./create-element";
import { RenderError } from "./render-error";

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

  const { currentIndent = 0, indent = 2 } = options ?? {};

  assertSync(jsxElement);

  if (jsxElement.type === "textNode") {
    return `${" ".repeat(currentIndent)}${jsxElement.text}`;
  }

  if (typeof jsxElement.tag !== "string") {
    if (typeof jsxElement.tag !== "function") {
      throw new RenderError("Invalid element");
    }
    try {
      const subJSXElement = await jsxElement.tag(jsxElement.props);
      return await jsxToString(subJSXElement, { indent, currentIndent });
    } catch (err) {
      if (err instanceof RenderError) {
        err.pushTag(getName(jsxElement.tag));
        throw err;
      }
      throw new RenderError(getErrorMessage(err), getName(jsxElement.tag));
    }
  } else {
    const element = createElement(jsxElement);
    if (element.tag === "") {
      try {
        const result: string[] = [];
        for (const child of element.children) {
          const str = await jsxToString(child, {
            indent,
            currentIndent: currentIndent + indent,
          });
          if (str.length > 0) {
            result.push(str);
          }
        }
        return result.join("\n");
      } catch (err) {
        if (err instanceof RenderError) {
          err.pushTag(element.tag);
          throw err;
        }
        throw new RenderError(getErrorMessage(err), element.tag);
      }
    } else {
      try {
        const padding = " ".repeat(currentIndent);
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

        return [startTag, ...children, endTag].join("\n");
      } catch (err) {
        if (err instanceof RenderError) {
          err.pushTag(element.tag);
          throw err;
        }
        throw new RenderError(getErrorMessage(err), element.tag);
      }
    }
  }
}

function assertSync(e: JSX.Element): asserts e is JSX.SyncElement {}

function isTextNode(e: JSX.Element) {
  return (
    typeof e === "object" && e != null && "type" in e && e.type === "textNode"
  );
}

function getName(component: Function) {
  if ("name" in component && typeof component.name === "string") {
    return component.name;
  }
  return "Anonymous";
}

function getErrorMessage(err: any) {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return String(err);
}
