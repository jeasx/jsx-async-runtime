import { JSX_NODE_MARKER } from "../jsx/jsx-node-marker.js";

/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on) and Sets, e.g. children like `{[<Header />, ids.map(loadItem)]}`
 * or an array prop. A plain object is only walked when it's the value itself (not `nested`),
 * e.g. a prop like `data={{ user: loadUser() }}`, so passing large or cyclic data
 * (e.g. rows that reference their parent) to many elements stays cheap and safe.
 * Other iterables are skipped: generators and iterator helpers are lazy,
 * so their promises don't exist yet.
 */
export function handleRejection(value: unknown, start = 0, nested = false): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (value instanceof Promise) {
    value.then(undefined, () => {});
  } else if (Array.isArray(value)) {
    for (let index = start; index < value.length; index++) {
      handleRejection(value[index], 0, true);
    }
  } else if (value instanceof Set) {
    for (const item of value) {
      handleRejection(item, 0, true);
    }
  } else if (
    !nested &&
    // Elements had their own props handled when they were created.
    (value as Record<symbol, unknown>)[JSX_NODE_MARKER] !== true
  ) {
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      for (const key in value) {
        handleRejection((value as Record<string, unknown>)[key], 0, true);
      }
    }
  }
}
