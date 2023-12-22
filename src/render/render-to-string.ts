import { jsxToString } from "./jsx-to-string";
import { RenderError } from "./render-error";

export async function renderToString(
  component: JSX.Element | Promise<JSX.Element>,
  options?: {
    indent?: number;
  },
): Promise<string> {
  try {
    return await jsxToString(await component, options);
  } catch (err) {
    if (err instanceof RenderError) {
      err.updateMessage();
    }
    throw err;
  }
}
