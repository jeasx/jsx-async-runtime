// Marks elements and raw markup created by jsx(), createElement() and html().
// JSON can't contain Symbols, so parsed data (e.g. a request body) can never pass as either.
// `Symbol.for` makes the marker work even when two copies of this package are loaded.
export const JSX_NODE_MARKER = Symbol.for("jsx-async-runtime.node");
