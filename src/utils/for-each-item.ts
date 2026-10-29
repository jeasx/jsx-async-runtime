/** The collections whose items are rendered and can be read without using them up. */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;

/**
 * Calls `visit` with `value`, or, when it is an array, a Set or a Map, with each item in it
 * and in the arrays, Sets and Maps nested in it. Only objects are visited, never the
 * collections themselves.
 *
 * Arrays are walked from `start` on (nested ones from the first item), Maps by keys and values,
 * since rendering a Map renders its entries. Other iterables are skipped: generators and
 * iterator helpers are lazy, so their items don't exist yet, and iterators of collections
 * (e.g. `map.values()`) can't be read without using them up.
 */
export function forEachItem(value: unknown, visit: (item: object) => void, start = 0): void {
  if (typeof value !== "object" || value === null) {
    return;
  }
  if (isCollection(value)) {
    forEachInCollection(value, visit, start);
  } else {
    visit(value);
  }
}

/** Like `forEachItem`, for a value already known to be a collection. */
export function forEachInCollection(
  collection: Collection,
  visit: (item: object) => void,
  start = 0,
): void {
  walk(collection, start, visit, undefined);
}

/** Checks for the collections that are walked: arrays, Sets and Maps. */
export function isCollection(value: object): value is Collection {
  return Array.isArray(value) || value instanceof Set || value instanceof Map;
}

/**
 * Visits the items of a collection, and of the collections nested in it.
 * `seen` holds the collections walked so far, so an array that contains itself
 * is walked only once instead of overflowing the stack. It is created at the first
 * nested collection, so flat arrays (the common case) need no Set.
 */
function walk(
  collection: Collection,
  start: number,
  visit: (item: object) => void,
  seen: Set<object> | undefined,
): void {
  if (Array.isArray(collection)) {
    for (let index = start; index < collection.length; index++) {
      seen = visitItem(collection[index], collection, visit, seen);
    }
  } else if (collection instanceof Set) {
    for (const item of collection) {
      seen = visitItem(item, collection, visit, seen);
    }
  } else {
    for (const [key, item] of collection) {
      seen = visitItem(key, collection, visit, seen);
      seen = visitItem(item, collection, visit, seen);
    }
  }
}

/**
 * Visits an item of `collection`, or walks it when it is a collection itself.
 * Returns `seen`, which is created here once the first nested collection is found.
 */
function visitItem(
  item: unknown,
  collection: Collection,
  visit: (item: object) => void,
  seen: Set<object> | undefined,
): Set<object> | undefined {
  if (typeof item !== "object" || item === null) {
    return seen;
  }
  if (!isCollection(item)) {
    visit(item);
    return seen;
  }
  seen ??= new Set<object>([collection]);
  if (!seen.has(item)) {
    seen.add(item);
    walk(item, 0, visit, seen);
  }
  return seen;
}
