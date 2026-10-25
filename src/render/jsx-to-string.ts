import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";

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
 * This function runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 *
 * @param {any} this - The (optional) 'this' context of the function.
 * @param {JSX.Element} jsxElement - The JSX element to render.
 * @return {string | Promise<string>} The string representation of the rendered JSX element.
 */
export function jsxToString(this: any, jsxElement: JSX.Element): string | Promise<string> {
  assertSync(jsxElement);

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

  if (Array.isArray(jsxElement)) {
    return renderChildren.call(this, jsxElement);
  }

  if ("html" in jsxElement) {
    return jsxElement.html;
  }

  if (jsxElement.type === "textNode") {
    return $jsxEscapeHTML ? escapeHTML(jsxElement.text) : jsxElement.text;
  }

  if (typeof jsxElement.tag === "string") {
    const tag = jsxElement.tag;
    const children = jsxElement.props.children
      ? Array.isArray(jsxElement.props.children)
        ? jsxElement.props.children
        : [jsxElement.props.children as JSX.Element]
      : [];
    if (tag === "") {
      return renderChildren.call(this, children);
    } else {
      const attributes = attributesToString(jsxElement.props);
      const separator = attributes.length ? " " : "";

      if (children.length === 0 && VOID_TAGS.has(tag)) {
        return `<${tag}${separator}${attributes}>`;
      }

      const open = `<${tag}${separator}${attributes}>`;
      const close = `</${tag}>`;
      const content = renderChildren.call(this, children);
      return isPromise(content)
        ? content.then(($content) => open + $content + close)
        : open + content + close;
    }
  }

  if (typeof jsxElement.tag === "function") {
    const jsxElementTag = jsxElement.tag.call(this, jsxElement.props);
    return isPromise(jsxElementTag)
      ? Promise.resolve(jsxElementTag).then((tag) => $jsxToString.call(this, tag))
      : $jsxToString.call(this, jsxElementTag);
  }

  return "";
}

/**
 * Renders children in order. Stays sync until a child returns a promise,
 * then continues the remaining children sequentially.
 */
function renderChildren(this: any, children: JSX.Element[]): string | Promise<string> {
  const result = [];
  for (const child of children) {
    const pendingChild = isPromise(child)
      ? Promise.resolve(child).then(($child) => $jsxToString.call(this, $child))
      : $jsxToString.call(this, child);
    if (isPromise(pendingChild)) {
      return renderChildrenAsync.call(this, children, pendingChild, result);
    }
    result.push(pendingChild);
  }
  return result.join("");
}

/**
 * Continues rendering after the first async child. `result` holds one entry
 * per rendered child, so `result.length` is the index of the next child.
 */
async function renderChildrenAsync(
  this: any,
  children: JSX.Element[],
  pendingChild: PromiseLike<string>,
  result: string[],
): Promise<string> {
  result.push(await pendingChild);
  while (result.length < children.length) {
    result.push(await $jsxToString.call(this, await children[result.length]));
  }
  return result.join("");
}

function $jsxToString(this: any, jsxElement: JSX.Element): string | Promise<string> {
  return (this?.jsxToString ?? jsxToString).call(this, jsxElement);
}

function isPromise(value: unknown): value is PromiseLike<any> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function";
}

function assertSync(_e: JSX.Element): asserts _e is JSX.SyncElement {}
