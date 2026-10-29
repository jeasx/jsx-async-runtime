import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { handleRejection } from "../utils/handle-rejection.js";
import { isByteArray } from "../utils/is-byte-array.js";
import { isPromise } from "../utils/is-promise.js";
// Circular import: render-element.ts renders iterables with this module. Safe, since
// neither module calls the other while loading, only while rendering.
import { flushAndAwait, Writer } from "../utils/writer.js";
import { renderNested } from "./render-element.js";

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
export function renderIterator(
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
export async function renderAsyncIterable(
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
