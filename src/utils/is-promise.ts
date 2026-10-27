/**
 * Checks for thenables, not just native promises, so promise-like values
 * from other libraries or realms are awaited too.
 */
export function isPromise(value: unknown): value is PromiseLike<any> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function";
}
