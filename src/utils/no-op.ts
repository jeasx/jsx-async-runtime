/**
 * Does nothing. Used as a rejection handler for promises whose errors are reported elsewhere,
 * and as a cleanup function when there is nothing to clean up.
 */
export function noOp(): void {}
