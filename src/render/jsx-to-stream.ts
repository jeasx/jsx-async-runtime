import { cancelUnreadStreams } from "../utils/cancel-unread-streams.js";
import { isPromise } from "../utils/is-promise.js";
import { resolveContext } from "../utils/resolve-context.js";
import { renderElement, Writer } from "./render-element.js";
import { streamWriters } from "./stream-writers.js";

// Characters per chunk and queued in the stream before rendering pauses.
const CHUNK_SIZE = 16 * 1024;

/**
 * Renders a JSX element to a stream of strings.
 * Markup rendered so far is sent as a chunk whenever rendering waits
 * for an async component (or promise child), and whenever about 16 KB
 * of markup has piled up, so large sync pages are streamed as well.
 *
 * @param this - Optional context passed to all components (e.g. `jsxToStream.call({}, jsx)`).
 *   Without one, the render gets a new empty object, so components can always write to `this`.
 * @param jsxElement - The JSX element to render.
 * @return A stream of markup chunks. It errors if a component throws.
 */
export function jsxToStream(this: any, jsxElement: JSX.Element): ReadableStream<string> {
  const context = resolveContext(this, "jsxToStream", jsxToStream);

  const writer: Writer = {
    buffer: "",
    chunkSize: CHUNK_SIZE,
    cancelled: false,
    flush() {},
  };

  // Resolves the pause when the reader wants more (or cancels).
  let resume: (() => void) | undefined;

  const wakeUp = () => {
    resume?.();
    resume = undefined;
  };

  const source: UnderlyingDefaultSource<string> = {
    start(controller) {
      writer.flush = () => {
        if (writer.cancelled) {
          throw new Error("Stream cancelled");
        }
        if (writer.buffer !== "") {
          controller.enqueue(writer.buffer);
          writer.buffer = "";
        }
        // Backpressure: wait while the reader has enough queued markup.
        if ((controller.desiredSize ?? 1) <= 0) {
          return new Promise<void>((resolve) => {
            resume = resolve;
          });
        }
      };
      // Lets nested jsxToString calls with this context (e.g. from an override) see a cancel.
      // Removed once rendering ended, unless another stream took the context over.
      const isObject = typeof context === "object" || typeof context === "function";
      if (isObject) {
        streamWriters.set(context, writer);
      }
      const end = () => {
        if (isObject && streamWriters.get(context) === writer) {
          streamWriters.delete(context);
        }
      };
      const done = () => {
        end();
        // The reader is gone, so the stream must not be written or closed anymore.
        if (writer.cancelled) {
          return;
        }
        // Enqueue the rest directly instead of calling flush(): nothing renders after it,
        // so there is no need to wait for the reader to catch up.
        if (writer.buffer !== "") {
          controller.enqueue(writer.buffer);
          writer.buffer = "";
        }
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
    pull: wakeUp,
    cancel() {
      writer.cancelled = true;
      writer.buffer = "";
      // Let paused rendering continue, so it stops at the next component.
      wakeUp();
    },
  };

  return new ReadableStream<string>(source, {
    highWaterMark: CHUNK_SIZE,
    size: (chunk) => chunk.length,
  });
}
