import { handleRejection } from "./handle-rejection.js";
import { isJsxNode } from "./is-jsx-node.js";

/**
 * Called when rendering failed or the stream reader cancelled. Cancels the `ReadableStream`s
 * in `value` that rendering didn't get to (e.g. a `fetch()` body after an earlier sibling threw),
 * so they don't keep a connection open. The render error is passed as the reason.
 *
 * Walks arrays (from `start` on), the children of elements and what promises resolve to.
 * Other props aren't walked: a component that never ran doesn't own them.
 * Streams that are being read are locked and left alone.
 */
export function cancelUnreadStreams(value: unknown, reason: unknown, start = 0): void {
  try {
    walk(value, reason, start);
  } catch {
    // The render error wins, e.g. over a stack overflow from an array that contains itself.
  }
}

function walk(value: unknown, reason: unknown, start: number): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  if (Array.isArray(value)) {
    for (let index = start; index < value.length; index++) {
      walk(value[index], reason, 0);
    }
  } else if (value instanceof Promise) {
    // Deliberately not isPromise(): calling then() on other thenables can start work early.
    value.then(
      ($value) => cancelUnreadStreams($value, reason),
      () => {},
    );
  } else if (typeof ReadableStream === "function" && value instanceof ReadableStream) {
    if (!value.locked) {
      handleRejection(value.cancel(reason));
    }
  } else if (isJsxNode(value)) {
    walk((value as { props?: { children?: unknown } }).props?.children, reason, 0);
  }
}
