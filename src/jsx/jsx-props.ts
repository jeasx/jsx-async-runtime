import type { ElementNode } from "./jsx.types.js";

// A function child, e.g. a render prop: `<Loader>{(data) => <p>{data}</p>}</Loader>`.
type RenderProp = (...args: any[]) => unknown;
export type Child = JSX.Children | RenderProp;

// The props of an element, where children may also be render props.
export type Props = Omit<ElementNode["props"], "children"> & { children?: Child | Child[] };
