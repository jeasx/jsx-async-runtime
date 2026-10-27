export function isPromise(value: unknown): value is PromiseLike<any> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function";
}
