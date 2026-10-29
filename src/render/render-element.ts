import { isJsxNode } from "../jsx/is-jsx-node.js";
import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { decodeByteRun, decodeBytes, isByteRun } from "../utils/decode-bytes.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { hasOwnStringForm } from "../utils/has-own-string-form.js";
import { isAsyncIterable } from "../utils/is-async-iterable.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isIterable } from "../utils/is-iterable.js";
import { isPromise } from "../utils/is-promise.js";
import { flushAndAwait, flushIfFull, throwIfCancelled, type Writer } from "../utils/writer.js";
import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";
import { renderAsyncIterable, renderIterator } from "./render-iterables.js";

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

// Skips keys inherited from a polluted `Object.prototype`.
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Iterators of the built-in collections (arrays, typed arrays, `Map` and `Set`), whose items
// already exist, so reading them up front costs no extra work and lets early promise rejections
// in them be handled like in an array.
const EAGER_ITERATORS = new Set(["Array Iterator", "Map Iterator", "Set Iterator"]);

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
    return renderElement.call(this, decodeBytes(jsxElement), writer);
  }

  // Other iterables, e.g. a generator returned by a component.
  if (isIterable(jsxElement)) {
    const iterator = jsxElement[Symbol.iterator]();
    // Built-in collections (e.g. a `Set` or `map.values()`) already hold their items, which may
    // include promises that reject early, so they are rendered like an array. Everything else
    // (e.g. a generator, `iterator.map()` or an object with a `*[Symbol.iterator]()` method)
    // may be lazy, so it is read item by item: a long one streams without being held in memory,
    // and an endless one can be stopped by a cancel.
    if (EAGER_ITERATORS.has((iterator as any)[Symbol.toStringTag])) {
      return renderChildren.call(this, toArray(iterator), writer);
    }
    return renderIterator.call(this, iterator as Iterator<JSX.Element>, writer);
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
    if (hasOwnStringForm(jsxElement)) {
      return renderElement.call(this, String(jsxElement), writer);
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
    const tag = jsxElement.tag;
    // Children are passed as written: none, a single child (e.g. `0` or a `Set`) or an array.
    // Own children only, so `children` from a polluted `Object.prototype` isn't rendered
    // in every element without children.
    const props = jsxElement.props;
    const $children = hasOwnProperty.call(props, "children") ? props.children : undefined;
    const children: JSX.Element[] =
      $children == null ? [] : Array.isArray($children) ? $children : [$children as JSX.Element];
    if (tag === "") {
      return renderChildren.call(this, children, writer);
    }
    if (!isValidTagName(tag)) {
      // The children are never rendered, so cancel their streams to not keep a connection open.
      if (children.length) {
        cancelUnreadStreams(children, new Error(`Children of <${tag}> are not rendered`));
      }
      return;
    }
    const attributes = attributesToString(jsxElement.props);
    if (typeof attributes !== "string") {
      // Promise attributes: send the markup so far while they load.
      return flushAndAwait(writer, attributes).then(($attributes) =>
        renderTag.call(this, tag, $attributes, children, writer),
      );
    }
    return renderTag.call(this, tag, attributes, children, writer);
  }

  if (typeof jsxElement.tag === "function") {
    // Don't call more components once the stream reader is gone.
    throwIfCancelled(writer);
    const returned = jsxElement.tag.call(this, jsxElement.props);
    // If rendering what the component returned fails (e.g. a layout that throws),
    // cancel the streams in it that rendering didn't get to.
    let pending: void | Promise<void>;
    try {
      pending = isPromise(returned)
        ? flushAndAwait(writer, returned).then((value) => renderNested.call(this, value, writer))
        : renderNested.call(this, returned, writer);
    } catch (error) {
      cancelUnreadStreams(returned, error);
      throw error;
    }
    if (isPromise(pending)) {
      return pending.then(undefined, (error) => {
        cancelUnreadStreams(returned, error);
        throw error;
      });
    }
    return;
  }

  // Any other tag is a mistake, e.g. `undefined` from a missing import, so fail like React does.
  // The render error handling cancels the streams in the children, which are never rendered.
  throw new TypeError(
    `Invalid element type: expected a tag name or a component, got ${jsxElement.tag === null ? "null" : typeof jsxElement.tag}. ` +
      "Check for a missing import or a wrong default export.",
  );
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
    // The children are never rendered, so cancel their streams to not keep a connection open.
    // Most void tags have no children, so this usually creates no error.
    if (children.length) {
      cancelUnreadStreams(children, new Error(`Children of <${tag}> are not rendered`));
    }
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
 * Renders children in order. Stays sync until a child has to wait,
 * then continues the remaining children sequentially.
 */
function renderChildren(this: any, children: JSX.Element[], writer: Writer): void | Promise<void> {
  let i = 0;
  try {
    for (; i < children.length; i++) {
      const child = children[i]!;
      let pending: void | Promise<void>;
      if (isPromise(child)) {
        pending = flushAndAwait(writer, child).then(($child) =>
          renderNested.call(this, $child, writer),
        );
      } else {
        let element = child;
        // `typeof` first, so text children skip the byte check.
        if (typeof child === "object" && isByteRun(children, i)) {
          [element, i] = decodeByteRun(children, i);
        }
        pending = renderNested.call(this, element, writer);
        if (!pending) {
          // Send large sync markup early; continue async if the reader is behind.
          pending = flushIfFull(writer);
        }
      }
      if (isPromise(pending)) {
        // Rendering won't get to the later children right away.
        handleRejection(children, i + 1);
        return renderChildrenAsync.call(this, children, i, pending, writer);
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
 * Continues rendering the children once the child at `index` (`pendingChild`) is done.
 */
async function renderChildrenAsync(
  this: any,
  children: JSX.Element[],
  index: number,
  pendingChild: Promise<void>,
  writer: Writer,
): Promise<void> {
  try {
    await pendingChild;
    while (++index < children.length) {
      const child = children[index]!;
      let element: JSX.Element = child;
      if (isPromise(child)) {
        element = await flushAndAwait(writer, child);
      } else if (typeof child === "object" && isByteRun(children, index)) {
        [element, index] = decodeByteRun(children, index);
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
 * Reads the rest of an iterator into an array.
 * Works for iterators that aren't iterable themselves, unlike `Array.from()`.
 */
function toArray(iterator: Iterator<unknown>): JSX.Element[] {
  const items: JSX.Element[] = [];
  for (let result = iterator.next(); !result.done; result = iterator.next()) {
    items.push(result.value as JSX.Element);
  }
  return items;
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * The override returns a string, which is appended to the writer.
 * `undefined` and `null` render nothing, so `return;` drops an element.
 */
export function renderNested(
  this: any,
  jsxElement: JSX.Element,
  writer: Writer,
): void | Promise<void> {
  const $jsxToString = this?.jsxToString;
  // Only functions count, so a `jsxToString` value inherited from a polluted `Object.prototype`
  // (e.g. a string from a naive deep merge of a request body) can't break every render.
  if (typeof $jsxToString !== "function") {
    return renderElement.call(this, jsxElement, writer);
  }
  const result = $jsxToString.call(this, jsxElement);
  if (isPromise(result)) {
    return flushAndAwait(writer, result).then(($result) => {
      writer.buffer += $result ?? "";
    });
  }
  writer.buffer += result ?? "";
}
