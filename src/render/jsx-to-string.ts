import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { isPromise } from "../utils/is-promise.js";
import { resolveContext } from "../utils/resolve-context.js";
import { renderElement, Writer } from "./render-element.js";

/**
 * Renders a JSX element to a string.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 *
 * @param this - Optional context passed to all components (e.g. `jsxToString.call({}, jsx)`).
 *   Without one, the render gets a new empty object, so components can always write to `this`.
 * @param jsxElement - The JSX element to render.
 * @return The rendered markup, or a promise of it when rendering had to wait.
 */
export function jsxToString(this: any, jsxElement: JSX.Element): string | Promise<string> {
  // Collect all markup in the buffer, nothing is sent early.
  const writer: Writer = { buffer: "", chunkSize: Infinity, cancelled: false, flush() {} };
  try {
    const pending = renderElement.call(resolveContext(this), jsxElement, writer);
    return isPromise(pending)
      ? pending.then(
          () => writer.buffer,
          (error) => {
            // Streams that rendering didn't get to won't be read anymore.
            cancelUnreadStreams(jsxElement, error);
            throw error;
          },
        )
      : writer.buffer;
  } catch (error) {
    cancelUnreadStreams(jsxElement, error);
    // Report errors the same way, whether rendering was sync or async.
    return Promise.reject(error);
  }
}
