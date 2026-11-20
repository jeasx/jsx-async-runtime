import { isJsxNode } from "../jsx/is-jsx-node.js";
import { forEachInCollection, forEachItem } from "./for-each-item.js";
import { isCollection } from "./is-collection.js";
import { noOp } from "./no-op.js";

// Skips keys inherited from a polluted `Object.prototype`. Module-local for V8's fast path,
// see attributes-to-string.ts.
const hasOwnProperty = Object.prototype.hasOwnProperty;

// How many levels of plain objects are walked, e.g. `data={{ user: { profile: loadProfile() } }}`.
// Bounds the walk, so cyclic data (e.g. `data.self = data`) ends without a `seen` set.
const MAX_OBJECT_DEPTH = 5;

/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on), Sets and Maps (keys and values), e.g. children like
 * `{[<Header />, ids.map(loadItem)]}` or an array prop, and into plain objects nested in plain
 * objects, a few levels deep, e.g. a prop like `data={{ user: { profile: loadProfile() } }}`.
 * Plain objects in collections aren't walked, so passing large or cyclic data (e.g. rows that
 * reference their parent) to many elements stays cheap and safe.
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
    if (isPlainObject(value)) {
      handleObject(value as Record<string, unknown>, MAX_OBJECT_DEPTH);
    }
  }
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** Handles the values of a plain object, and of the plain objects nested in it (`depth` levels). */
function handleObject(record: Record<string, unknown>, depth: number): void {
  for (const key in record) {
    if (!hasOwnProperty.call(record, key)) {
      continue;
    }
    const item = record[key];
    if (
      depth > 1 &&
      typeof item === "object" &&
      item !== null &&
      !(item instanceof Promise) &&
      !isCollection(item) &&
      !isJsxNode(item) &&
      isPlainObject(item)
    ) {
      handleObject(item as Record<string, unknown>, depth - 1);
    } else {
      forEachItem(item, ignoreRejection);
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
