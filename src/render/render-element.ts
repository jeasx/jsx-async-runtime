import { JSX_NODE_MARKER } from "../jsx/jsx-node-marker.js";
import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { isAsyncIterable } from "../utils/is-async-iterable.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isIterable } from "../utils/is-iterable.js";
import { isPromise } from "../utils/is-promise.js";
import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";

/**
 * Receives the rendered markup. Markup is appended to `buffer`.
 * `flush` is called before rendering waits for a promise and whenever the buffer
 * reaches `chunkSize`, so a writer can send the markup rendered so far
 * (or ignore it to collect a string).
 * It returns a promise when rendering should pause until the reader catches up.
 */
export type Writer = {
  buffer: string;
  /** Buffer length that triggers a flush between elements (`Infinity` to never flush early). */
  chunkSize: number;
  /** Set when the stream reader cancels; rendering stops at the next component. */
  cancelled: boolean;
  flush(): void | Promise<void>;
};

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

// A tag must start with an ASCII letter and must not contain characters
// that end the tag name or break the markup.
const isValidTagName = createNameValidator(/^[a-zA-Z][^\s"'<>/=&\x00-\x1f\x7f-\x9f]*$/);

// Decodes bytes that come in one piece. Used without the `stream` option,
// it keeps no state between calls, so one instance is shared.
const textDecoder = new TextDecoder();

/**
 * Renders a JSX element into the writer.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 */
export function renderElement(
  this: any,
  jsxElement: JSX.Element,
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
    return renderElement.call(this, textDecoder.decode(jsxElement), writer);
  }

  // Other iterables, e.g. a generator returned by a component.
  if (isIterable(jsxElement)) {
    return renderChildren.call(this, Array.from(jsxElement), writer);
  }

  // Async iterables, e.g. an async generator component or a `ReadableStream`.
  if (isAsyncIterable(jsxElement)) {
    return renderAsyncIterable.call(this, jsxElement as AsyncIterable<JSX.Element>, writer);
  }

  // Only nodes created by jsx(), createElement() or html() are rendered as markup. Look-alike objects,
  // e.g. from JSON.parse() or a database record, render nothing, so user data can't inject markup.
  if ((jsxElement as Record<symbol, unknown>)[JSX_NODE_MARKER] !== true) {
    // Objects with their own string form (e.g. `Date`, `URL`, `Error`) render it, escaped like text.
    // Plain objects use the default `toString` (or have none), so they don't render "[object Object]".
    const toString = (jsxElement as { toString?: unknown }).toString;
    if (typeof toString === "function" && toString !== Object.prototype.toString) {
      return renderElement.call(this, String(jsxElement), writer);
    }
    return;
  }

  if ("html" in jsxElement) {
    if (typeof jsxElement.html === "string") {
      writer.buffer += jsxElement.html;
    }
    return;
  }

  if (typeof jsxElement.tag === "string") {
    const tag = jsxElement.tag;
    // Children are passed as written: none, a single child (e.g. `0` or a `Set`) or an array.
    const $children = jsxElement.props.children;
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
    if (writer.cancelled) {
      throw new Error("Stream cancelled");
    }
    const returned = jsxElement.tag.call(this, jsxElement.props);
    // If rendering what the component returned fails (e.g. a layout that throws),
    // cancel the streams in it that rendering didn't get to.
    let pending: void | Promise<void>;
    try {
      pending = isPromise(returned)
        ? flushAndAwait(writer, returned).then((value) => $renderElement.call(this, value, writer))
        : $renderElement.call(this, returned, writer);
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
  // HTML tag names are case-insensitive, so `<BR>` is void too.
  if (VOID_TAGS.has(tag) || VOID_TAGS.has(tag.toLowerCase())) {
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
          $renderElement.call(this, $child, writer),
        );
      } else {
        let element = child;
        // `typeof` first, so text children skip the byte check.
        if (typeof child === "object" && isByteRun(children, i)) {
          [element, i] = decodeByteRun(children, i);
        }
        pending = $renderElement.call(this, element, writer);
        if (!pending && writer.buffer.length >= writer.chunkSize) {
          // Send large sync markup early; continue async if the reader is behind.
          pending = writer.flush();
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
      const pending = $renderElement.call(this, element, writer);
      if (isPromise(pending)) {
        await pending;
      }
      if (writer.buffer.length >= writer.chunkSize) {
        await writer.flush();
      }
    }
  } catch (error) {
    // From the failed child on, rendering won't get to the rest.
    cancelUnreadStreams(children, error, index);
    throw error;
  }
}

/**
 * Checks if the child at `index` and the one after it are both bytes,
 * e.g. chunks collected from a stream or yielded by a generator.
 */
function isByteRun(children: JSX.Element[], index: number): boolean {
  return isByteArray(children[index]) && isByteArray(children[index + 1]);
}

/**
 * Decodes the bytes at `index` together with the bytes that follow it as one text,
 * so a character split between two of them is decoded correctly, like in an async iterable.
 * Returns the text and the index of the last bytes it decoded.
 */
function decodeByteRun(children: JSX.Element[], index: number): [string, number] {
  const decoder = new TextDecoder();
  let text = "";
  for (; index < children.length && isByteArray(children[index]); index++) {
    text += decoder.decode(children[index] as Uint8Array, { stream: true });
  }
  // Bytes of a character cut off at the end render as the replacement character "�".
  return [text + decoder.decode(), index - 1];
}

/**
 * Renders the items of an async iterable in order.
 * The markup rendered so far is sent while waiting for each item, so items stream as they arrive.
 * When rendering fails or the stream is cancelled, the source is stopped like `for await` does
 * (e.g. an async generator runs its `finally` block and can close a database cursor).
 */
async function renderAsyncIterable(
  this: any,
  iterable: AsyncIterable<JSX.Element>,
  writer: Writer,
): Promise<void> {
  const iterator = iterable[Symbol.asyncIterator]();
  // Set when the source itself failed, so it isn't asked to stop.
  let sourceFailed = false;
  const next = async () => {
    try {
      return await iterator.next();
    } catch (error) {
      sourceFailed = true;
      throw error;
    }
  };
  // The item being rendered, so its unread streams can be cancelled when it fails.
  let item: JSX.Element;
  // Decodes byte items (e.g. the chunks of a `fetch()` body) as UTF-8 text. One decoder
  // for all chunks, so a character split between two chunks is decoded correctly.
  let decoder: TextDecoder | undefined;
  try {
    for (;;) {
      // Don't pull more items once the stream reader is gone.
      if (writer.cancelled) {
        throw new Error("Stream cancelled");
      }
      const result = await flushAndAwait(writer, next());
      if (result.done) {
        // Bytes of a character cut off at the end render as the replacement character "\uFFFD".
        const rest = decoder?.decode();
        if (rest) {
          const pending = $renderElement.call(this, rest, writer);
          if (isPromise(pending)) {
            await pending;
          }
        }
        return;
      }
      item = result.value;
      if (isByteArray(item)) {
        decoder ??= new TextDecoder();
        item = decoder.decode(item, { stream: true });
      } else if (decoder) {
        // The bytes ended, so the text left in the decoder comes before this item.
        item = [decoder.decode(), item];
        decoder = undefined;
      }
      const pending = $renderElement.call(this, item, writer);
      if (isPromise(pending)) {
        await pending;
      }
    }
  } catch (error) {
    cancelUnreadStreams(item, error);
    if (!sourceFailed) {
      // Stop the source without waiting for it, so the render error is reported right away.
      // The original error wins, so errors while stopping are ignored.
      try {
        handleRejection(iterator.return?.());
      } catch {}
    }
    throw error;
  }
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * The override returns a string, which is appended to the writer.
 * `undefined` and `null` render nothing, so `return;` drops an element.
 */
function $renderElement(this: any, jsxElement: JSX.Element, writer: Writer): void | Promise<void> {
  const $jsxToString = this?.jsxToString;
  if (!$jsxToString) {
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

/**
 * Sends the markup rendered so far, then waits for `value`
 * and (when the stream reader is behind) for the reader to catch up.
 * Both are awaited together, so a rejection of `value` is handled right away.
 */
function flushAndAwait<T>(writer: Writer, value: PromiseLike<T>): Promise<T> {
  let ready: void | Promise<void>;
  try {
    ready = writer.flush();
  } catch (error) {
    // The flush failed (e.g. the stream was cancelled), so `value` is never awaited.
    handleRejection(value);
    throw error;
  }
  if (!ready) {
    return Promise.resolve(value);
  }
  return Promise.all([value, ready]).then(([$value]) => $value);
}
