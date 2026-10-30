import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { decodeItem, finishDecoding, type ByteDecoding } from "../utils/decode-bytes.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isPromise } from "../utils/is-promise.js";
import { flushAndAwait, flushIfFull, throwIfCancelled, type Writer } from "../utils/writer.js";
// Circular import: render-element.ts renders iterables with this module. Safe, since
// neither module calls the other while loading, only while rendering.
import { renderAwaitable, renderChildren } from "./render-element.js";

// Iterators of the built-in collections (arrays, typed arrays, `Map` and `Set`), whose items
// already exist, so reading them up front costs no extra work and lets early promise rejections
// in them be handled like in an array.
const EAGER_ITERATORS = new Set(["Array Iterator", "Map Iterator", "Set Iterator"]);

/** The progress of reading a lazy iterator or an async iterable. */
type IteratorState = ByteDecoding & {
  /** Set once the iterator is used up. */
  done: boolean;
  /** Set when the source itself failed, so it isn't asked to stop. */
  sourceFailed: boolean;
  /** The item being rendered, so its unread streams can be cancelled when it fails. */
  item: JSX.Element;
  /** An item held back by takeItem() for the next turn, so the text before it renders first. */
  queued: { item: JSX.Element } | undefined;
};

function createIteratorState(): IteratorState {
  return {
    done: false,
    sourceFailed: false,
    item: undefined,
    queued: undefined,
    decoder: undefined,
  };
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
  const item = result.value;
  if (isByteArray(item)) {
    state.item = decodeItem(state, item);
    return true;
  }
  // Bytes cut off within a character leave "�" in the decoder. It renders first, as its own
  // item, so the item itself reaches an override as is (a promise resolved), not in an array.
  const rest = finishDecoding(state);
  if (rest !== "") {
    state.item = rest;
    state.queued = { item };
    return true;
  }
  state.item = item;
  return true;
}

/**
 * Takes the item held back by takeItem() into `state.item`.
 * Returns `false` when there is none, so the next item must be read from the iterator.
 */
function takeQueuedItem(state: IteratorState): boolean {
  if (!state.queued) {
    return false;
  }
  state.item = state.queued.item;
  state.queued = undefined;
  return true;
}

/**
 * Renders an iterable other than an array or bytes, e.g. a `Set` or a generator.
 * Built-in collections (e.g. a `Set` or `map.values()`) already hold their items, which may
 * include promises that reject early, so they are rendered like an array. Everything else
 * (e.g. a generator, `iterator.map()` or an object with a `*[Symbol.iterator]()` method)
 * may be lazy, so it is read item by item: a long one streams without being held in memory,
 * and an endless one can be stopped by a cancel.
 */
export function renderIterable(
  this: any,
  iterable: Iterable<unknown>,
  writer: Writer,
): void | Promise<void> {
  const iterator = iterable[Symbol.iterator]();
  if (EAGER_ITERATORS.has((iterator as any)[Symbol.toStringTag])) {
    return renderChildren.call(this, toArray(iterator), writer);
  }
  return renderIterator.call(this, iterator as Iterator<JSX.Element>, writer);
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
      // Send large sync markup early; continue async if the reader is behind.
      const pending = renderNextItem.call(this, iterator, state, writer) || flushIfFull(writer);
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
      throwIfCancelled(writer);
      const pending = renderNextItem.call(this, iterator, state, writer);
      if (isPromise(pending)) {
        await pending;
      }
      const flushed = flushIfFull(writer);
      if (flushed) {
        await flushed;
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
  if (!takeQueuedItem(state)) {
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
  }
  return renderAwaitable.call(this, state.item, writer);
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
  // A held-back item (e.g. a `fetch()` body after cut-off bytes) is never rendered either.
  cancelUnreadStreams(state.queued?.item, error);
  if (!state.sourceFailed) {
    try {
      // Async iterators return a promise, whose rejection must not crash Node.
      handleRejection(iterator.return?.());
    } catch {}
  }
}

/**
 * Reads a `ReadableStream` with its own reader instead of its async iterator. The iterator's
 * `return()` waits for a pending read, so a stalled source (e.g. a `fetch()` body whose server
 * stopped sending) would never be cancelled. `reader.cancel()` ends a pending read right away.
 */
function readStream(stream: ReadableStream<JSX.Element>): AsyncIterator<JSX.Element> {
  const reader = stream.getReader();
  return {
    next: () => reader.read() as Promise<IteratorResult<JSX.Element>>,
    return: async () => {
      await reader.cancel();
      return { done: true, value: undefined };
    },
  };
}

/**
 * Renders the items of an async iterable in order.
 * The markup rendered so far is sent while waiting for each item, so items stream as they arrive.
 * When rendering fails or the stream is cancelled, the source is stopped like `for await` does
 * (e.g. an async generator runs its `finally` block and can close a database cursor).
 * An async generator waiting inside an `await` can't be interrupted: its `return()` runs
 * only once that `await` settles. A `ReadableStream` is cancelled right away (see readStream()).
 */
export async function renderAsyncIterable(
  this: any,
  iterable: AsyncIterable<JSX.Element>,
  writer: Writer,
): Promise<void> {
  const iterator =
    typeof ReadableStream === "function" && iterable instanceof ReadableStream
      ? readStream(iterable)
      : iterable[Symbol.asyncIterator]();
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
      throwIfCancelled(writer);
      // When the stream reader cancels, the wait for a slow or endless source (e.g. a live feed)
      // ends at once, and the source is stopped below.
      if (!takeQueuedItem(state)) {
        const result = await flushAndAwait(writer, next());
        if (!takeItem(state, result)) {
          return;
        }
      }
      // Awaitable, so a promise item (e.g. from a `ReadableStream`) reaches a `this.jsxToString`
      // override resolved, like in arrays and sync iterables.
      const pending = renderAwaitable.call(this, state.item, writer);
      if (isPromise(pending)) {
        await pending;
      }
    }
  } catch (error) {
    stopIterator(iterator, state, error);
    throw error;
  }
}
