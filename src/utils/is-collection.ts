/** The collections whose items are rendered and can be read without using them up. */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;

/** Checks for the collections that are walked: arrays, Sets and Maps. */
export function isCollection(value: object): value is Collection {
  return Array.isArray(value) || value instanceof Set || value instanceof Map;
}
