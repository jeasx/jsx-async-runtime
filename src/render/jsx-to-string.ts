import {
  cancelUnreadStreams,
  cancelUnreadStreamsOnRejection,
} from "../utils/cancel-unread-streams.js";
import { isPromise } from "../utils/is-promise.js";
import { resolveContext } from "../utils/resolve-context.js";
import { createStringWriter, getStreamWriter } from "../utils/writer.js";
import { renderElement } from "./render-element.js";

/**
 * Renders a JSX element to a string.
 * Runs synchronously as long as possible and only returns a promise once rendering
 * has to wait, e.g. for an async component, a promise or an async iterable.
 *
 * @param this - Optional context passed to all components (e.g. `jsxToString.call({}, jsx)`).
 *   Without one, the render gets a new empty object, so components can always write to `this`.
 * @param jsxElement - The JSX element to render, or a promise of it.
 * @return The rendered markup, or a promise of it when rendering had to wait.
 */
export function jsxToString(
  this: any,
  jsxElement: JSX.Element | PromiseLike<JSX.Element>,
): string | Promise<string> {
  try {
    const context = resolveContext(this, "jsxToString", jsxToString);
    const writer = createStringWriter(getStreamWriter(context));
    const pending = renderElement.call(context, jsxElement, writer);
    return isPromise(pending)
      ? cancelUnreadStreamsOnRejection(
          pending.then(() => writer.buffer),
          jsxElement,
        )
      : writer.buffer;
  } catch (error) {
    cancelUnreadStreams(jsxElement, error);
    // Report errors the same way, whether rendering was sync or async.
    return Promise.reject(error);
  }
}
