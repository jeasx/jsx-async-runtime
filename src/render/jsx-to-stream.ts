import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { isPromise } from "../utils/is-promise.js";
import { resolveContext } from "../utils/resolve-context.js";
import {
  attachStreamWriter,
  cancelWriter,
  createStreamWriter,
  enqueueBuffer,
  type Writer,
} from "../utils/writer.js";
import { renderElement } from "./render-element.js";

// Characters per chunk and queued in the stream before rendering pauses.
const CHUNK_SIZE = 16 * 1024;

/**
 * Renders a JSX element to a stream of strings.
 * Markup rendered so far is sent as a chunk whenever rendering waits
 * (e.g. for an async component, a promise or an async iterable), and whenever
 * about 16,000 characters of markup have piled up, so large sync pages are streamed as well.
 *
 * @param this - Optional context passed to all components (e.g. `jsxToStream.call({}, jsx)`).
 *   Without one, the render gets a new empty object, so components can always write to `this`.
 * @param jsxElement - The JSX element to render, or a promise of it.
 * @return A stream of markup chunks. It errors if a component throws.
 */
export function jsxToStream(
  this: any,
  jsxElement: JSX.Element | PromiseLike<JSX.Element>,
): ReadableStream<string> {
  let context: any;
  try {
    context = resolveContext(this, "jsxToStream", jsxToStream);
  } catch (error) {
    // Report errors through the stream, like a component that throws,
    // and like jsxToString(), which returns a rejected promise.
    cancelUnreadStreams(jsxElement, error);
    return new ReadableStream<string>({
      start(controller) {
        controller.error(error);
      },
    });
  }

  // Set in `start`, which the stream calls right away (the controller only exists there).
  let writer: Writer;

  const source: UnderlyingDefaultSource<string> = {
    start(controller) {
      writer = createStreamWriter(controller, CHUNK_SIZE);
      const end = attachStreamWriter(context, writer);
      const done = () => {
        end();
        // The reader is gone, so the stream must not be written or closed anymore.
        if (writer.cancelled) {
          return;
        }
        // Enqueue the rest directly instead of calling flush(): nothing renders after it,
        // so there is no need to wait for the reader to catch up.
        enqueueBuffer(writer, controller);
        controller.close();
      };
      const fail = (error: unknown) => {
        end();
        // Streams that rendering didn't get to won't be read anymore.
        cancelUnreadStreams(jsxElement, error);
        if (!writer.cancelled) {
          controller.error(error);
        }
      };
      try {
        const pending = renderElement.call(context, jsxElement, writer);
        if (isPromise(pending)) {
          pending.then(done, fail);
        } else {
          done();
        }
      } catch (error) {
        fail(error);
      }
    },
    // The reader wants more, so a render paused by backpressure continues.
    pull() {
      writer.resume();
    },
    cancel() {
      cancelWriter(writer);
    },
  };

  return new ReadableStream<string>(source, {
    highWaterMark: CHUNK_SIZE,
    size: (chunk) => chunk.length,
  });
}
