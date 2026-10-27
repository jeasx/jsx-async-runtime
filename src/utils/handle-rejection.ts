/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 */
export function handleRejection(value: unknown): void {
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (value instanceof Promise) {
    value.then(undefined, () => {});
  }
}
