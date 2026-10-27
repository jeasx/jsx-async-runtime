/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 */
export function handleRejection(value: unknown): void {
  if (value instanceof Promise) {
    value.then(undefined, () => {});
  }
}

export function isPromise(value: unknown): value is PromiseLike<any> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function";
}
