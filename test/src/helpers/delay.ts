export function delay(ms: number): Promise<void>;
export function delay<T>(ms: number, value: T): Promise<T>;
export function delay<T>(ms: number, value?: T): Promise<T | undefined> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
