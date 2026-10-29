// Thenables whose then() doesn't return a promise.
export const thenable = <T>(value: T): PromiseLike<T> =>
  ({ then: (resolve: (value: T) => void) => void resolve(value) }) as unknown as PromiseLike<T>;
