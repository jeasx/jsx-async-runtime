import { isJsxNode } from "../jsx/is-jsx-node.js";

type Container = unknown[] | Set<unknown> | Map<unknown, unknown> | Record<string, unknown>;

/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on), Sets and Maps (keys and values), e.g. children like
 * `{[<Header />, ids.map(loadItem)]}` or an array prop. A plain object is only walked when it's the value itself (not nested),
 * e.g. a prop like `data={{ user: loadUser() }}`, so passing large or cyclic data
 * (e.g. rows that reference their parent) to many elements stays cheap and safe.
 * Other iterables are skipped: generators and iterator helpers are lazy, so their promises
 * don't exist yet, and iterators of collections (e.g. `map.values()`) can't be read
 * without using them up.
 */
export function handleRejection(value: unknown, start = 0): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (value instanceof Promise) {
    value.then(undefined, ignore);
  } else if (isCollection(value)) {
    walk(value, start, undefined);
  } else if (!isJsxNode(value)) {
    // Elements are skipped, since their props were handled when they were created.
    const prototype = Object.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null) {
      walk(value as Record<string, unknown>, 0, undefined);
    }
  }
}

function ignore(): void {}

/** Checks for the collections that are walked: arrays, Sets and Maps. */
function isCollection(value: object): value is unknown[] | Set<unknown> | Map<unknown, unknown> {
  return Array.isArray(value) || value instanceof Set || value instanceof Map;
}

/**
 * Handles the promises in a container, and in the arrays, Sets and Maps nested in it.
 * `seen` holds the containers walked so far, so an array that contains itself
 * is walked only once instead of overflowing the stack. It is created at the first
 * nested collection, so flat arrays (the common case) need no Set.
 */
function walk(container: Container, start: number, seen: Set<object> | undefined): void {
  if (Array.isArray(container)) {
    for (let index = start; index < container.length; index++) {
      seen = handleItem(container[index], container, seen);
    }
  } else if (container instanceof Set) {
    for (const item of container) {
      seen = handleItem(item, container, seen);
    }
  } else if (container instanceof Map) {
    // Rendering a Map renders its entries, so keys count too.
    for (const [key, item] of container) {
      seen = handleItem(key, container, seen);
      seen = handleItem(item, container, seen);
    }
  } else {
    for (const key in container) {
      seen = handleItem(container[key], container, seen);
    }
  }
}

/**
 * Handles an item of `container`. Nested plain objects and elements are skipped.
 * Returns `seen`, which is created here once the first nested collection is found.
 */
function handleItem(
  item: unknown,
  container: Container,
  seen: Set<object> | undefined,
): Set<object> | undefined {
  if (typeof item !== "object" || item === null) {
    return seen;
  }
  if (item instanceof Promise) {
    item.then(undefined, ignore);
  } else if (isCollection(item)) {
    seen ??= new Set<object>([container]);
    if (!seen.has(item)) {
      seen.add(item);
      walk(item, 0, seen);
    }
  }
  return seen;
}
