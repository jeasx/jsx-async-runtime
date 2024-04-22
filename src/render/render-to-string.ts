import { jsxToString } from "./jsx-to-string";

export async function renderToString(
  component: JSX.Element | Promise<JSX.Element>
): Promise<string> {
  return await jsxToString(await component);
}
