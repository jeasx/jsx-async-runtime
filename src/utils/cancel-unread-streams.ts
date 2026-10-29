import { isJsxNode } from "../jsx/is-jsx-node.js";
import { forEachItem } from "./for-each-item.js";
import { getOwnChildren } from "./get-own-children.js";
import { handleRejection } from "./handle-rejection.js";
import { noOp } from "./no-op.js";

/**
 * Called when rendering failed or the stream reader cancelled. Cancels the `ReadableStream`s
 * in `value` that rendering didn't get to (e.g. a `fetch()` body after an earlier sibling threw),
 * so they don't keep a connection open. The render error is passed as the reason.
 *
 * Walks arrays (from `start` on), Sets and Maps like `handleRejection`, and also the children
 * of elements and what promises resolve to. Other props aren't walked: a component that never ran
 * doesn't own them. Node.js readable streams (e.g. from `fs.createReadStream()`) are destroyed,
 * so they don't keep a file open. Streams that are being read are left alone.
 */
export function cancelUnreadStreams(value: unknown, reason: unknown, start = 0): void {
  try {
    forEachItem(value, (item) => cancelItem(item, reason), start);
  } catch {
    // The render error wins, e.g. over a stack overflow from an element nested in its own children.
  }
}

/**
 * Passes on the result of `pending`. When it rejects, first cancels the unread streams in `value`
 * (e.g. what a component returned), since rendering won't get to them anymore.
 */
export function cancelUnreadStreamsOnRejection<T>(pending: Promise<T>, value: unknown): Promise<T> {
  return pending.then(undefined, (error) => {
    cancelUnreadStreams(value, error);
    throw error;
  });
}

type NodeStream ={ destroy(): void; destroyed?: boolean; readableFlowing: boolean | null };

/**
 * Checks for a Node.js readable stream (e.g. from `fs.createReadStream()`) that nobody reads yet.
 * Checked by shape, so the package doesn't import `node:stream` and works in other runtimes.
 * `readableFlowing` is `null` until the stream is read, piped or paused, so streams that are
 * in use (e.g. iterated by the renderer) are left alone, like a locked `ReadableStream`.
 */
function isUnreadNodeStream(value: object): value is NodeStream {
  const stream = value as Partial<NodeStream> & { pipe?: unknown };
  return (
    typeof stream.pipe === "function" &&
    typeof stream.destroy === "function" &&
    "readableFlowing" in stream &&
    stream.readableFlowing === null &&
    stream.destroyed !== true
  );
}

function cancelItem(item: object, reason: unknown): void {
  if (item instanceof Promise) {
    // Deliberately not isPromise(): calling then() on other thenables can start work early.
    item.then(($item) => cancelUnreadStreams($item, reason), noOp);
  } else if (typeof ReadableStream === "function" && item instanceof ReadableStream) {
    if (!item.locked) {
      handleRejection(item.cancel(reason));
    }
  } else if (isUnreadNodeStream(item)) {
    // Without the reason: `destroy(error)` emits an "error" event, which crashes Node
    // when nobody listens for it.
    item.destroy();
  } else if (isJsxNode(item) && item.type === "tag") {
    forEachItem(getOwnChildren(item.props), (child) => cancelItem(child, reason));
  }
}
