// Thenables whose then() doesn't return a promise.
export const thenable = (value) => ({ then: (resolve) => void resolve(value) });
