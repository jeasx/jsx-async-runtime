import { isJsxNode } from "../jsx/is-jsx-node.js";
import { forEachInCollection, forEachItem, isCollection } from "./for-each-item.js";
import { noOp } from "./no-op.js";

/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on), Sets and Maps (keys and values), e.g. children like
 * `{[<Header />, ids.map(loadItem)]}` or an array prop. A plain object is only walked when it's the value itself (not nested),
 * e.g. a prop like `data={{ user: loadUser() }}`, so passing large or cyclic data
 * (e.g. rows that reference their parent) to many elements stays cheap and safe.
 */
export function handleRejection(value: unknown, start = 0): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  // Checked from cheap to costly, since this runs for every prop of every element.
  if (value instanceof Promise) {
    ignoreRejection(value);
  } else if (isCollection(value)) {
    forEachInCollection(value, ignoreRejection, start);
  } else if (!isJsxNode(value)) {
    // Elements are skipped, since their props were handled when they were created.
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      const record = value as Record<string, unknown>;
      for (const key in record) {
        forEachItem(record[key], ignoreRejection);
      }
    }
  }
}

function ignoreRejection(item: object): void {
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (item instanceof Promise) {
    item.then(undefined, noOp);
  }
}
