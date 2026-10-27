import { isIterable } from "../utils/iterables.js";
import { handleRejection, isPromise } from "../utils/promises.js";
import { attributesToString } from "./attributes-to-string.js";
import { escapeHTML } from "./escape-entities.js";
import { createNameValidator } from "./name-validator.js";

/**
 * Receives the rendered markup. Markup is appended to `buffer`.
 * `flush` is called before rendering waits for a promise and whenever the buffer
 * reaches `chunkSize`, so a writer can send the markup rendered so far
 * (or ignore it to collect a string).
 * It returns a promise when rendering should pause until the reader catches up.
 */
export type Writer = {
  buffer: string;
  /** Buffer length that triggers a flush between elements (`Infinity` to never flush early). */
  chunkSize: number;
  /** Set when the stream reader cancels; rendering stops at the next component. */
  cancelled: boolean;
  flush(): void | Promise<void>;
};

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

const NODE = Symbol.for("jsx-async-runtime.node");

/**
 * Renders a JSX element into the writer.
 * Runs synchronously as long as possible and only returns a promise
 * when an async component (or promise child) is encountered.
 */
export function renderElement(
  this: any,
  jsxElement: JSX.Element,
  writer: Writer,
): void | Promise<void> {
  if (jsxElement === null) {
    return;
  }

  if (isPromise(jsxElement)) {
    return flushAndAwait(writer, jsxElement).then((element) =>
      renderElement.call(this, element, writer),
    );
  }

  switch (typeof jsxElement) {
    case "string":
      // Only an explicit `false` turns escaping off, so a wrong value (e.g. "true" or 0) stays safe.
      writer.buffer += this?.jsxEscapeHTML === false ? jsxElement : escapeHTML(jsxElement);
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

  // Other iterables, e.g. a generator returned by a component.
  if (isIterable(jsxElement)) {
    return renderChildren.call(this, Array.from(jsxElement), writer);
  }

  // Only nodes created by jsx(), createElement() or html() are rendered. Look-alike objects,
  // e.g. from JSON.parse() or a database record, render nothing, so user data can't inject markup.
  if ((jsxElement as Record<symbol, unknown>)[NODE] !== true) {
    return;
  }

  if ("html" in jsxElement) {
    if (typeof jsxElement.html === "string") {
      writer.buffer += jsxElement.html;
    }
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

    // Void tags can't have content or a closing tag, so their children are ignored.
    if (VOID_TAGS.has(tag)) {
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
      throw new Error("Stream cancelled");
    }
    const jsxElementTag = jsxElement.tag.call(this, jsxElement.props);
    if (isPromise(jsxElementTag)) {
      return flushAndAwait(writer, jsxElementTag).then((tag) =>
        $renderElement.call(this, tag, writer),
      );
    }
    return $renderElement.call(this, jsxElementTag, writer);
  }
}

/**
 * Renders children in order. Stays sync until a child has to wait,
 * then continues the remaining children sequentially.
 */
function renderChildren(this: any, children: JSX.Element[], writer: Writer): void | Promise<void> {
  let i = 0;
  try {
    for (; i < children.length; i++) {
      const child = children[i]!;
      let pending: void | Promise<void>;
      if (isPromise(child)) {
        pending = flushAndAwait(writer, child).then(($child) =>
          $renderElement.call(this, $child, writer),
        );
      } else {
        pending = $renderElement.call(this, child, writer);
        if (!pending && writer.buffer.length >= writer.chunkSize) {
          // Send large sync markup early; continue async if the reader is behind.
          pending = writer.flush();
        }
      }
      if (isPromise(pending)) {
        for (let index = i + 1; index < children.length; index++) {
          handleRejection(children[index]);
        }
        return renderChildrenAsync.call(this, children, i + 1, pending, writer);
      }
    }
  } catch (error) {
    for (let index = i + 1; index < children.length; index++) {
      handleRejection(children[index]);
    }
    throw error;
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
      element = await flushAndAwait(writer, child);
    }
    // Only wait when the child has to, so sync siblings don't cost extra microtasks.
    const pending = $renderElement.call(this, element, writer);
    if (isPromise(pending)) {
      await pending;
    }
    if (writer.buffer.length >= writer.chunkSize) {
      await writer.flush();
    }
  }
}

/**
 * Renders a nested element, honoring a `this.jsxToString` override.
 * The override returns a string, which is appended to the writer.
 * `undefined` and `null` render nothing, so `return;` drops an element.
 */
function $renderElement(this: any, jsxElement: JSX.Element, writer: Writer): void | Promise<void> {
  const $jsxToString = this?.jsxToString;
  if (!$jsxToString) {
    return renderElement.call(this, jsxElement, writer);
  }
  const result = $jsxToString.call(this, jsxElement);
  if (isPromise(result)) {
    return flushAndAwait(writer, result).then(($result) => {
      writer.buffer += $result ?? "";
    });
  }
  writer.buffer += result ?? "";
}

/**
 * Sends the markup rendered so far, then waits for `value`
 * and (when the stream reader is behind) for the reader to catch up.
 * Both are awaited together, so a rejection of `value` is handled right away.
 */
function flushAndAwait<T>(writer: Writer, value: PromiseLike<T>): Promise<T> {
  const ready = writer.flush();
  if (!ready) {
    return Promise.resolve(value);
  }
  return Promise.all([value, ready]).then(([$value]) => $value);
}
