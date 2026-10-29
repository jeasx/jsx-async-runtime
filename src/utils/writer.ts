import { handleRejection } from "./handle-rejection.js";

/**
 * The writer of the stream that a context is rendered to, set by `jsxToStream` while rendering.
 * A nested `jsxToString` call with the same context (e.g. from a `this.jsxToString` override
 * or a component) uses it to stop when the stream reader cancels, like the stream itself does.
 * Keyed by context, so streams rendered at the same time need their own context objects.
 */
export const streamWriters = new WeakMap<object, Writer>();

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

/**
 * The error that ends rendering when the stream reader cancels.
 */
export function cancelledError(): Error {
  return new Error("Stream cancelled");
}

/**
 * Throws when the stream reader cancelled, so rendering stops before doing more work.
 */
export function throwIfCancelled(writer: Pick<Writer, "cancelled">): void {
  if (writer.cancelled) {
    throw cancelledError();
  }
}

/**
 * Sends the markup rendered so far, then waits for `value`
 * and (when the stream reader is behind) for the reader to catch up.
 * Both are awaited together, so a rejection of `value` is handled right away.
 * When the stream reader cancels, the wait rejects at once instead of waiting for `value`.
 */
export function flushAndAwait<T>(writer: Writer, value: PromiseLike<T>): Promise<T> {
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
