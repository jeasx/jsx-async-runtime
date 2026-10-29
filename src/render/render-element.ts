import { isJsxNode } from "../jsx/is-jsx-node.js";
import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { createNameValidator } from "../utils/create-name-validator.js";
import { decodeBytes } from "../utils/decode-bytes.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { hasOwnStringForm } from "../utils/has-own-string-form.js";
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
  /**
   * Rejects the pending waits (e.g. for a promise child or the next item of an async iterable)
   * when the stream reader cancels, so a slow or endless wait doesn't keep the render going.
   * Each wait adds its reject function and removes it once settled.
   * Shared with nested `jsxToString` writers, so they stop too.
   */
  waits: Set<(error: Error) => void> | undefined;
  flush(): void | Promise<void>;
};

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
    if (writer.cancelled) {
      throw new Error("Stream cancelled");
    }
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
      const pending = renderNested.call(this, element, writer);
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
 * Decodes the byte items of an iterator or async iterable (e.g. the chunks of a `fetch()` body)
 * as UTF-8 text. One decoder for consecutive byte items, so a character split between two of them
 * is decoded correctly. Created at the first byte item, so other iterators need none.
 */
type ByteDecoding = {
  decoder: TextDecoder | undefined;
};

/**
 * Returns what to render for the next item: bytes are decoded as text,
 * and the text left in the decoder by the bytes before the item comes first.
 */
function decodeItem(state: ByteDecoding, item: JSX.Element): JSX.Element {
  if (isByteArray(item)) {
    state.decoder ??= new TextDecoder();
    return state.decoder.decode(item, { stream: true });
  }
  if (state.decoder) {
    const rest = state.decoder.decode();
    state.decoder = undefined;
    return [rest, item];
  }
  return item;
}

/**
 * Returns the text left in the decoder once the items ended, or `""`.
 * Bytes of a character cut off at the end render as the replacement character "�".
 */
function finishDecoding(state: ByteDecoding): string {
  const rest = state.decoder?.decode() ?? "";
  state.decoder = undefined;
  return rest;
}

/** The progress of reading a lazy iterator or an async iterable. */
type IteratorState = ByteDecoding & {
  /** Set once the iterator is used up. */
  done: boolean;
  /** Set when the source itself failed, so it isn't asked to stop. */
  sourceFailed: boolean;
  /** The item being rendered, so its unread streams can be cancelled when it fails. */
  item: JSX.Element;
};

function createIteratorState(): IteratorState {
  return { done: false, sourceFailed: false, item: undefined, decoder: undefined };
}

/**
 * Takes the next result of the iterator into `state.item`, with bytes decoded as text.
 * At the end, it sets `state.done` and takes the text left in the decoder.
 * Returns `false` when there is nothing to render.
 */
function takeItem(state: IteratorState, result: IteratorResult<JSX.Element>): boolean {
  if (result.done) {
    state.done = true;
    state.item = finishDecoding(state);
    return state.item !== "";
  }
  state.item = decodeItem(state, result.value);
  return true;
}

/**
 * Renders the items of a lazy iterator (e.g. a generator) in order, reading one item at a time.
 * Stays sync until an item has to wait, then continues async. Large sync markup is flushed
 * as it piles up, so `jsxToStream` sends it early and pauses the iterator while the reader is behind.
 * When rendering fails or the stream is cancelled, the iterator is stopped like `for...of` does
 * (e.g. a generator runs its `finally` block).
 */
function renderIterator(
  this: any,
  iterator: Iterator<JSX.Element>,
  writer: Writer,
): void | Promise<void> {
  const state = createIteratorState();
  try {
    while (!state.done) {
      let pending = renderNextItem.call(this, iterator, state, writer);
      if (!pending && writer.buffer.length >= writer.chunkSize) {
        // Send large sync markup early; continue async if the reader is behind.
        pending = writer.flush();
      }
      if (isPromise(pending)) {
        return renderIteratorAsync.call(this, iterator, state, pending, writer);
      }
    }
  } catch (error) {
    stopIterator(iterator, state, error);
    throw error;
  }
}

/**
 * Continues rendering the iterator once the current item (`pendingItem`) is done.
 */
async function renderIteratorAsync(
  this: any,
  iterator: Iterator<JSX.Element>,
  state: IteratorState,
  pendingItem: Promise<void>,
  writer: Writer,
): Promise<void> {
  try {
    await pendingItem;
    while (!state.done) {
      // Don't read more items once the stream reader is gone.
      if (writer.cancelled) {
        throw new Error("Stream cancelled");
      }
      const pending = renderNextItem.call(this, iterator, state, writer);
      if (isPromise(pending)) {
        await pending;
      }
      if (writer.buffer.length >= writer.chunkSize) {
        await writer.flush();
      }
    }
  } catch (error) {
    stopIterator(iterator, state, error);
    throw error;
  }
}

/**
 * Reads the next item of the iterator and renders it. Sets `state.done` at the end.
 * Consecutive byte items are decoded as one text, like in an array or an async iterable.
 */
function renderNextItem(
  this: any,
  iterator: Iterator<JSX.Element>,
  state: IteratorState,
  writer: Writer,
): void | Promise<void> {
  let result: IteratorResult<JSX.Element>;
  try {
    result = iterator.next();
  } catch (error) {
    state.sourceFailed = true;
    throw error;
  }
  if (!takeItem(state, result)) {
    return;
  }
  const item = state.item;
  if (isPromise(item)) {
    return flushAndAwait(writer, item).then(($item) => renderNested.call(this, $item, writer));
  }
  return renderNested.call(this, item, writer);
}

/**
 * Cancels the unread streams of the failed item and stops the iterator, unless the iterator
 * itself failed. Errors while stopping are ignored, so the original error wins.
 * An async iterator is stopped without waiting for it, so the render error is reported right away.
 */
function stopIterator(
  iterator: Iterator<unknown> | AsyncIterator<unknown>,
  state: IteratorState,
  error: unknown,
): void {
  cancelUnreadStreams(state.item, error);
  if (!state.sourceFailed) {
    try {
      // Async iterators return a promise, whose rejection must not crash Node.
      handleRejection(iterator.return?.());
    } catch {}
  }
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
  const state = createIteratorState();
  const next = async () => {
    try {
      return await iterator.next();
    } catch (error) {
      state.sourceFailed = true;
      throw error;
    }
  };
  try {
    while (!state.done) {
      // Don't pull more items once the stream reader is gone.
      if (writer.cancelled) {
        throw new Error("Stream cancelled");
      }
      // When the stream reader cancels, the wait for a slow or endless source (e.g. a live feed)
      // ends at once, and the source is stopped below.
      const result = await flushAndAwait(writer, next());
      if (!takeItem(state, result)) {
        return;
      }
      const pending = renderNested.call(this, state.item, writer);
      if (isPromise(pending)) {
        await pending;
      }
    }
  } catch (error) {
    stopIterator(iterator, state, error);
    throw error;
  }
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * The override returns a string, which is appended to the writer.
 * `undefined` and `null` render nothing, so `return;` drops an element.
 */
function renderNested(this: any, jsxElement: JSX.Element, writer: Writer): void | Promise<void> {
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

/**
 * Sends the markup rendered so far, then waits for `value`
 * and (when the stream reader is behind) for the reader to catch up.
 * Both are awaited together, so a rejection of `value` is handled right away.
 * When the stream reader cancels, the wait rejects at once instead of waiting for `value`.
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
  const waiting = untilCancelled(writer, value);
  if (!ready) {
    return waiting;
  }
  return Promise.all([waiting, ready]).then(([$value]) => $value);
}

/**
 * Waits for `value`, but rejects as soon as the stream reader cancels.
 * Its reject function is kept in `writer.waits` only while waiting, so long renders
 * (e.g. an endless async iterable) don't pile up listeners.
 * A later rejection of `value` is still handled, so it can't crash Node.
 */
function untilCancelled<T>(writer: Writer, value: PromiseLike<T>): Promise<T> {
  const waits = writer.waits;
  if (!waits) {
    return Promise.resolve(value);
  }
  return new Promise<T>((resolve, reject) => {
    waits.add(reject);
    Promise.resolve(value).then(
      ($value) => {
        waits.delete(reject);
        resolve($value);
      },
      (error) => {
        waits.delete(reject);
        reject(error);
      },
    );
  });
}
