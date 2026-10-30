import { isJsxNode } from "../jsx/is-jsx-node.js";
import type { ElementProps } from "../jsx/jsx.types.js";
import {
  cancelUnreadStreams,
  cancelUnreadStreamsOnRejection,
} from "../utils/cancel-unread-streams.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { decodeByteRun, decodeBytes } from "../utils/decode-bytes.js";
import { getOwnChildren } from "../utils/get-own-children.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { isAsyncIterable } from "../utils/is-async-iterable.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isIterable } from "../utils/is-iterable.js";
import { isPromise } from "../utils/is-promise.js";
import { toText } from "../utils/to-text.js";
import { flushAndAwait, flushIfFull, throwIfCancelled, type Writer } from "../utils/writer.js";
import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";
// Circular import, like render-iterables.ts: only used while rendering, never while loading.
import { jsxToString } from "./jsx-to-string.js";
import { renderAsyncIterable, renderIterable } from "./render-iterables.js";

// HTML tag names are case-insensitive, so the uppercase and capitalized variants are void too
// (e.g. `<BR>` and `<Br>`). Other mixed case (e.g. `<bR>`) is rare and not recognized,
// so a single lookup does the check.
const VOID_TAGS = new Set(
  [
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
  ].flatMap((tag) => [tag, tag.toUpperCase(), tag[0]!.toUpperCase() + tag.slice(1)]),
);

// A tag must start with an ASCII letter and must not contain characters
// that end the tag name or break the markup.
const isValidTagName = createNameValidator(/^[a-zA-Z][^\s"'<>/=&\x00-\x1f\x7f-\x9f]*$/);

/**
 * Renders a JSX element into the writer.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 */
export function renderElement(
  this: any,
  jsxElement: JSX.Element | PromiseLike<JSX.Element>,
  writer: Writer,
): void | Promise<void> {
  if (jsxElement === null) {
    return;
  }

  if (isPromise(jsxElement)) {
    return flushAndAwait(writer, jsxElement).then((element) =>
      renderElement.call(this, element, writer),
    );
  }

  switch (typeof jsxElement) {
    case "string":
      writer.buffer += escapeHTML(jsxElement);
      return;
    case "bigint":
    case "number":
      writer.buffer += String(jsxElement);
      return;
    case "boolean":
    case "function":
    case "symbol":
    case "undefined":
      return;
  }

  if (Array.isArray(jsxElement)) {
    return renderChildren.call(this, jsxElement, writer);
  }

  // Bytes, e.g. a `Buffer` from `readFile()`, render as UTF-8 text, escaped like a string.
  if (isByteArray(jsxElement)) {
    writer.buffer += escapeHTML(decodeBytes(jsxElement));
    return;
  }

  // Other iterables, e.g. a `Set` or a generator returned by a component. Checked before
  // the string form, so iterables with their own `toString` (e.g. a `URLSearchParams` or an
  // Immutable.js `List`) render their items, like in React.
  if (isIterable(jsxElement)) {
    return renderIterable.call(this, jsxElement, writer);
  }

  // Async iterables, e.g. an async generator component or a `ReadableStream`.
  if (isAsyncIterable(jsxElement)) {
    return renderAsyncIterable.call(this, jsxElement as AsyncIterable<JSX.Element>, writer);
  }

  // Only nodes created by jsx(), createElement() or html() are rendered as markup. Look-alike objects,
  // e.g. from JSON.parse() or a database record, render nothing, so user data can't inject markup.
  if (!isJsxNode(jsxElement)) {
    // Objects with their own string form (e.g. `Date`, `URL`, `Error`) render it, escaped like text.
    // Plain objects render nothing instead of "[object Object]".
    const text = toText(jsxElement);
    if (text !== undefined) {
      writer.buffer += escapeHTML(text);
    }
    return;
  }

  // Raw markup from html(). Checked by its own `type`, since `html` could be inherited
  // from a polluted `Object.prototype` and would turn every element into raw markup.
  if (jsxElement.type === "html") {
    if (typeof jsxElement.html === "string") {
      writer.buffer += jsxElement.html;
    }
    return;
  }

  if (typeof jsxElement.tag === "string") {
    return renderTagElement.call(this, jsxElement.tag, jsxElement.props, writer);
  }

  if (typeof jsxElement.tag === "function") {
    return renderComponent.call(this, jsxElement.tag, jsxElement.props, writer);
  }

  // Any other tag is a mistake, e.g. `undefined` from a missing import, so fail like React does.
  // The render error handling cancels the streams in the children, which are never rendered.
  throw new TypeError(
    `Invalid element type: expected a tag name or a component, got ${jsxElement.tag === null ? "null" : typeof jsxElement.tag}. ` +
      "Check for a missing import or a wrong default export.",
  );
}

/**
 * Renders an element with a tag name, e.g. `<div>`, or a fragment (empty tag name).
 */
function renderTagElement(
  this: any,
  tag: string,
  props: ElementProps,
  writer: Writer,
): void | Promise<void> {
  const children = getChildren(props);
  if (tag === "") {
    return renderChildren.call(this, children, writer);
  }
  if (!isValidTagName(tag)) {
    discardChildren(tag, children);
    return;
  }
  const attributes = attributesToString(props);
  if (typeof attributes !== "string") {
    // Promise attributes: send the markup so far while they load.
    return flushAndAwait(writer, attributes).then(($attributes) =>
      renderTag.call(this, tag, $attributes, children, writer),
    );
  }
  return renderTag.call(this, tag, attributes, children, writer);
}

/**
 * Returns the own children as an array. They are passed as written:
 * none, a single child (e.g. `0` or a `Set`) or an array.
 */
function getChildren(props: ElementProps): JSX.Element[] {
  const children = getOwnChildren(props) as JSX.Children | undefined;
  return children == null ? [] : Array.isArray(children) ? children : [children as JSX.Element];
}

/**
 * Calls a component and renders what it returned.
 */
function renderComponent(
  this: any,
  component: Exclude<JSX.ElementType, string>,
  props: ElementProps,
  writer: Writer,
): void | Promise<void> {
  // Don't call more components once the stream reader is gone.
  throwIfCancelled(writer);
  const returned = component.call(this, props);
  // If rendering what the component returned fails (e.g. a layout that throws),
  // cancel the streams in it that rendering didn't get to.
  let pending: void | Promise<void>;
  try {
    pending = renderAwaitable.call(this, returned, writer);
  } catch (error) {
    cancelUnreadStreams(returned, error);
    throw error;
  }
  if (isPromise(pending)) {
    return cancelUnreadStreamsOnRejection(pending, returned);
  }
}

/**
 * Writes a tag with its rendered attributes and children.
 */
function renderTag(
  this: any,
  tag: string,
  attributes: string,
  children: JSX.Element[],
  writer: Writer,
): void | Promise<void> {
  writer.buffer += attributes.length ? `<${tag} ${attributes}>` : `<${tag}>`;

  // Void tags can't have content or a closing tag, so their children are ignored.
  if (VOID_TAGS.has(tag)) {
    discardChildren(tag, children);
    return;
  }

  const closeTag = `</${tag}>`;
  const pending = renderChildren.call(this, children, writer);
  if (isPromise(pending)) {
    return pending.then(() => {
      writer.buffer += closeTag;
    });
  }
  writer.buffer += closeTag;
}

/**
 * Cancels the streams of children that are never rendered (e.g. of a void tag),
 * so they don't keep a connection open. Most such tags have no children,
 * so this usually creates no error.
 */
function discardChildren(tag: string, children: JSX.Element[]): void {
  if (children.length) {
    cancelUnreadStreams(children, new Error(`Children of <${tag}> are not rendered`));
  }
}

/**
 * Renders children in order. Stays sync until a child has to wait,
 * then continues the remaining children sequentially.
 */
export function renderChildren(
  this: any,
  children: JSX.Element[],
  writer: Writer,
): void | Promise<void> {
  let i = 0;
  // Open only between bytes and a promise right after them, see decodeByteRun().
  let decoder: TextDecoder | undefined;
  try {
    for (; i < children.length; i++) {
      const child = children[i]!;
      if (isPromise(child)) {
        // Rendering won't get to the later children right away.
        handleRejection(children, i + 1);
        // Continues with this child, which renderChildrenAsync() awaits right away.
        return renderChildrenAsync.call(this, children, i - 1, undefined, writer, decoder);
      }
      let element = child;
      // `typeof` first, so text children skip the byte check.
      if (typeof child === "object" && isByteArray(child)) {
        [element, i, decoder] = decodeByteRun(children, i, child);
      }
      // Send large sync markup early; continue async if the reader is behind.
      const pending = renderNested.call(this, element, writer) || flushIfFull(writer);
      if (isPromise(pending)) {
        handleRejection(children, i + 1);
        return renderChildrenAsync.call(this, children, i, pending, writer, decoder);
      }
    }
  } catch (error) {
    // Rendering won't get to the later children at all.
    handleRejection(children, i + 1);
    cancelUnreadStreams(children, error, i);
    throw error;
  }
}

/**
 * Continues rendering the children after the child at `index`, once `pendingChild`
 * (the rendering of that child, if any) is done. `decoder` continues the bytes before
 * the next child, a promise, see decodeByteRun().
 */
async function renderChildrenAsync(
  this: any,
  children: JSX.Element[],
  index: number,
  pendingChild: void | Promise<void>,
  writer: Writer,
  decoder: TextDecoder | undefined,
): Promise<void> {
  try {
    if (pendingChild) {
      await pendingChild;
    }
    while (++index < children.length) {
      const child = children[index]!;
      let element: JSX.Element = isPromise(child) ? await flushAndAwait(writer, child) : child;
      if (typeof element === "object" && isByteArray(element)) {
        [element, index, decoder] = decodeByteRun(children, index, element, decoder);
      } else if (decoder) {
        // The bytes before a promise ended within a character: render the "�" left in the decoder
        // before what the promise resolved to.
        const rest = decoder.decode();
        decoder = undefined;
        if (rest !== "") {
          const pending = renderNested.call(this, rest, writer);
          if (isPromise(pending)) {
            await pending;
          }
        }
      }
      // Only wait when the child has to, so sync siblings don't cost extra microtasks.
      const pending = renderNested.call(this, element, writer);
      if (isPromise(pending)) {
        await pending;
      }
      const flushed = flushIfFull(writer);
      if (flushed) {
        await flushed;
      }
    }
  } catch (error) {
    // From the failed child on, rendering won't get to the rest.
    cancelUnreadStreams(children, error, index);
    throw error;
  }
}

/**
 * Renders a nested element that may be a promise.
 * The markup so far is sent while the promise loads.
 */
export function renderAwaitable(
  this: any,
  value: JSX.Element | PromiseLike<JSX.Element>,
  writer: Writer,
): void | Promise<void> {
  if (isPromise(value)) {
    return flushAndAwait(writer, value).then(($value) => renderNested.call(this, $value, writer));
  }
  return renderNested.call(this, value, writer);
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * Callers await promises first (see renderAwaitable()), so the override never gets one.
 * See writeOverrideResult() for how its result is rendered.
 */
export function renderNested(
  this: any,
  jsxElement: JSX.Element,
  writer: Writer,
): void | Promise<void> {
  const $jsxToString = this?.jsxToString;
  // Only functions count, so a `jsxToString` value inherited from a polluted `Object.prototype`
  // (e.g. a string from a naive deep merge of a request body) can't break every render.
  // The runtime's own `jsxToString` (e.g. in `{ jsxToString, user }`) renders the same
  // as no override, so it is skipped: that keeps streaming in chunks and avoids a nested render
  // per element.
  if (typeof $jsxToString !== "function" || $jsxToString === jsxToString) {
    return renderElement.call(this, jsxElement, writer);
  }
  // The override gets bytes as text, like the decoded runs of bytes in arrays and iterables,
  // so it doesn't have to handle both.
  const result = $jsxToString.call(
    this,
    isByteArray(jsxElement) ? decodeBytes(jsxElement) : jsxElement,
  );
  if (isPromise(result)) {
    return flushAndAwait(writer, result).then(($result) =>
      writeOverrideResult.call(this, $result, writer),
    );
  }
  return writeOverrideResult.call(this, result, writer);
}

/**
 * Writes what a `this.jsxToString` override returned. A string is markup and is written as is.
 * Anything else renders like a child instead of `[object Object]`: an element (e.g. a replacement)
 * as markup, a number as text, and `undefined`, `null` and `false` as nothing, so `return;` drops
 * an element. Like `jsxToString.call(this, result)`, the override applies to its children,
 * but not to the result itself, so returning the given element doesn't loop.
 */
function writeOverrideResult(this: any, result: unknown, writer: Writer): void | Promise<void> {
  if (typeof result === "string") {
    writer.buffer += result;
    return;
  }
  return renderElement.call(this, result as JSX.Element, writer);
}
