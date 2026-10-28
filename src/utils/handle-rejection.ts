import { isJsxNode } from "./is-jsx-node.js";

type Container = unknown[] | Set<unknown> | Record<string, unknown>;

/**
 * Promises start before rendering gets to them and may reject in the meantime.
 * Marks such a rejection as handled, so Node doesn't crash with an unhandled rejection.
 * Whoever awaits the promise later (the renderer or a component) still gets the error.
 *
 * Walks into arrays (from `start` on) and Sets, e.g. children like `{[<Header />, ids.map(loadItem)]}`
 * or an array prop. A plain object is only walked when it's the value itself (not nested),
 * e.g. a prop like `data={{ user: loadUser() }}`, so passing large or cyclic data
 * (e.g. rows that reference their parent) to many elements stays cheap and safe.
 * Other iterables are skipped: generators and iterator helpers are lazy,
 * so their promises don't exist yet.
 */
export function handleRejection(value: unknown, start = 0): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  // Deliberately not isPromise(): only native promises report unhandled rejections,
  // and calling then() on other thenables can start work early (e.g. a lazy query builder).
  if (value instanceof Promise) {
    value.then(undefined, ignore);
  } else if (Array.isArray(value) || value instanceof Set) {
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

/**
 * Handles the promises in a container, and in the arrays and Sets nested in it.
 * `seen` holds the containers walked so far, so an array that contains itself
 * is walked only once instead of overflowing the stack. It is created at the first
 * nested array or Set, so flat arrays (the common case) need no Set.
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
  } else {
    for (const key in container) {
      seen = handleItem(container[key], container, seen);
    }
  }
}

/**
 * Handles an item of `container`. Nested plain objects and elements are skipped.
 * Returns `seen`, which is created here once the first nested array or Set is found.
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
  } else if (Array.isArray(item) || item instanceof Set) {
    seen ??= new Set<object>([container]);
    if (!seen.has(item)) {
      seen.add(item);
      walk(item, 0, seen);
    }
  }
  return seen;
}
