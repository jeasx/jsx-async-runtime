/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on) and Sets, e.g. children like `{[<Header />, ids.map(loadItem)]}`
 * or an array prop. Other iterables are skipped: generators and iterator helpers are lazy,
 * so their promises don't exist yet.
 */
export function handleRejection(value: unknown, start = 0): void {
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (value instanceof Promise) {
    value.then(undefined, () => {});
  } else if (Array.isArray(value)) {
    for (let index = start; index < value.length; index++) {
      handleRejection(value[index]);
    }
  } else if (value instanceof Set) {
    for (const item of value) {
      handleRejection(item);
    }
  }
}
