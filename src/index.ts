export * from "./jsx/jsx.types";

export { createElement } from "./jsx/jsx-runtime";
export { escapeEntities } from "./render/escape-entities";
export {
  jsxToString,
  /** @deprecated */
  jsxToString as renderToString,
} from "./render/jsx-to-string";
