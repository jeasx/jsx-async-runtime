import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";
import { createNameValidator } from "./name-validator.js";

/**
 * Receives the rendered markup. Markup is appended to `buffer`.
 * `flush` is called before rendering waits for a promise, so a writer
 * can send the markup rendered so far (or ignore it to collect a string).
 */
type Writer = {
  buffer: string;
  /** Set when the stream reader cancels; rendering stops at the next component. */
  cancelled: boolean;
  flush(): void;
};

/** Thrown to stop rendering after the stream was cancelled. */
const CANCELLED = Symbol("cancelled");

/**
 * Renders a JSX element to a string.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 *
 * @param this - Optional context passed to all components (e.g. `jsxToString.call({}, jsx)`).
 * @param jsxElement - The JSX element to render.
 * @return The rendered markup, or a promise of it when rendering had to wait.
 */
export function jsxToString(this: any, jsxElement: JSX.Element): string | Promise<string> {
  // Collect all markup in the buffer, nothing is sent early.
  const writer: Writer = { buffer: "", cancelled: false, flush() {} };
  try {
    const pending = renderElement.call(this, jsxElement, writer);
    return isPromise(pending) ? pending.then(() => writer.buffer) : writer.buffer;
  } catch (error) {
    // Report errors the same way, whether rendering was sync or async.
    return Promise.reject(error);
  }
}

/**
 * Renders a JSX element to a stream of strings.
 * Markup rendered so far is sent as a chunk whenever rendering waits
 * for an async component (or promise child).
 *
 * @param this - Optional context passed to all components (e.g. `jsxToStream.call({}, jsx)`).
 * @param jsxElement - The JSX element to render.
 * @return A stream of markup chunks. It errors if a component throws.
 */
export function jsxToStream(this: any, jsxElement: JSX.Element): ReadableStream<string> {
  // eslint-disable-next-line typescript/no-this-alias
  const context = this;
  const writer: Writer = {
    buffer: "",
    cancelled: false,
    flush() {},
  };
  return new ReadableStream<string>({
    start(controller) {
      writer.flush = () => {
        if (writer.cancelled) {
          throw CANCELLED;
        }
        if (writer.buffer !== "") {
          controller.enqueue(writer.buffer);
          writer.buffer = "";
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
    cancel() {
      writer.cancelled = true;
      writer.buffer = "";
    },
  });
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

// A tag must start with an ASCII letter and must not contain characters
// that end the tag name or break the markup.
// eslint-disable-next-line no-control-regex
const isValidTagName = createNameValidator(/^[a-zA-Z][^\s"'<>/=&\x00-\x1f\x7f-\x9f]*$/);

/**
 * Renders a JSX element into the writer.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 */
function renderElement(this: any, jsxElement: JSX.Element, writer: Writer): void | Promise<void> {
  assertSync(jsxElement);

  if (jsxElement === null) {
    return;
  }

  switch (typeof jsxElement) {
    case "string":
      writer.buffer += (this?.jsxEscapeHTML ?? true) ? escapeHTML(jsxElement) : jsxElement;
      return;
    case "bigint":
    case "number":
      writer.buffer += String(jsxElement);
      return;
    case "boolean":
    case "function":
    case "symbol":
    case "undefined":
      return;
  }

  if (Array.isArray(jsxElement)) {
    return renderChildren.call(this, jsxElement, writer);
  }

  if ("html" in jsxElement) {
    writer.buffer += jsxElement.html;
    return;
  }

  if (typeof jsxElement.tag === "string") {
    const tag = jsxElement.tag;
    const children = jsxElement.props.children
      ? Array.isArray(jsxElement.props.children)
        ? jsxElement.props.children
        : [jsxElement.props.children as JSX.Element]
      : [];
    if (tag === "") {
      return renderChildren.call(this, children, writer);
    }
    if (!isValidTagName(tag)) {
      return;
    }
    const attributes = attributesToString(jsxElement.props);
    const openTag = attributes.length ? `<${tag} ${attributes}>` : `<${tag}>`;
    writer.buffer += openTag;

    if (children.length === 0 && VOID_TAGS.has(tag)) {
      return;
    }

    const closeTag = `</${tag}>`;
    const pending = renderChildren.call(this, children, writer);
    if (isPromise(pending)) {
      return pending.then(() => {
        writer.buffer += closeTag;
      });
    }
    writer.buffer += closeTag;
    return;
  }

  if (typeof jsxElement.tag === "function") {
    // Don't call more components once the stream reader is gone.
    if (writer.cancelled) {
      throw CANCELLED;
    }
    const jsxElementTag = jsxElement.tag.call(this, jsxElement.props);
    if (isPromise(jsxElementTag)) {
      writer.flush();
      return Promise.resolve(jsxElementTag).then((tag) => $renderElement.call(this, tag, writer));
    }
    return $renderElement.call(this, jsxElementTag, writer);
  }
}

/**
 * Renders children in order. Stays sync until a child has to wait,
 * then continues the remaining children sequentially.
 */
function renderChildren(this: any, children: JSX.Element[], writer: Writer): void | Promise<void> {
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!;
    let pending: void | Promise<void>;
    if (isPromise(child)) {
      writer.flush();
      pending = Promise.resolve(child).then(($child) => $renderElement.call(this, $child, writer));
    } else {
      pending = $renderElement.call(this, child, writer);
    }
    if (isPromise(pending)) {
      return renderChildrenAsync.call(this, children, i + 1, pending, writer);
    }
  }
}

async function renderChildrenAsync(
  this: any,
  children: JSX.Element[],
  index: number,
  pendingChild: Promise<void>,
  writer: Writer,
): Promise<void> {
  await pendingChild;
  for (; index < children.length; index++) {
    const child = children[index]!;
    let element: JSX.Element = child;
    if (isPromise(child)) {
      writer.flush();
      element = await child;
    }
    // Only wait when the child has to, so sync siblings don't cost extra microtasks.
    const pending = $renderElement.call(this, element, writer);
    if (isPromise(pending)) {
      await pending;
    }
  }
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * The override returns a string, which is appended to the writer.
 */
function $renderElement(this: any, jsxElement: JSX.Element, writer: Writer): void | Promise<void> {
  const $jsxToString = this?.jsxToString;
  if (!$jsxToString) {
    return renderElement.call(this, jsxElement, writer);
  }
  const result = $jsxToString.call(this, jsxElement);
  if (isPromise(result)) {
    writer.flush();
    return Promise.resolve(result).then(($result) => {
      writer.buffer += $result;
    });
  }
  writer.buffer += result;
}

function isPromise(value: unknown): value is PromiseLike<any> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function";
}

function assertSync(_e: JSX.Element): asserts _e is JSX.SyncElement {}
