import { isPromise } from "../utils/promises.js";
import { renderElement, Writer } from "./render-element.js";

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
  const context = this ?? {};

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
      const done = () => {
        // The reader is gone, so the stream must not be written or closed anymore.
        if (writer.cancelled) {
          return;
        }
        writer.flush();
        controller.close();
      };
      const fail = (error: unknown) => {
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
