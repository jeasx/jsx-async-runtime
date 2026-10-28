/**
 * Checks for thenables, not just native promises, so promise-like values
 * from other libraries or realms are awaited too.
 * Functions are never rendered, so only objects are awaited.
 */
export function isPromise(value: unknown): value is PromiseLike<any> {
  return (
    typeof value === "object" && typeof (value as PromiseLike<unknown> | null)?.then === "function"
  );
}
