# Changelog

## Unreleased

Adds streaming, renders about 2x faster than v2, supports many more child types and closes several injection paths.

### Breaking changes

- **Raw markup needs #html:** write `{html("<!DOCTYPE html>")}` instead of `{{ html: "<!DOCTYPE html>" }}` (import `html` from `jsx-async-runtime`). Plain `{ html }` objects render nothing.
- **Escaping can't be turned off:** removed `this.jsxEscapeHTML`. Wrap trusted markup in #html, or use a `this.jsxToString` override that returns text as is (e.g. for a trusted HTML stream from `fetch()`).
- **`class` and `style` are plain strings:** objects and arrays are no longer converted and render as JSON like other attributes. Use e.g. [clsx](https://github.com/lukeed/clsx) (`class={clsx("a", { b: cond })}`) and string styles (``style={`color: ${color}`}``). TypeScript accepts only strings.
- **Components get `children` as written**, like in React: one child as is, several as an array, no `children` prop without children. Previously always a flattened array without `null` and booleans. Normalize with `[children ?? []].flat()` if you need an array. Overrides and `props.children` also see children as written. Generators passed as children are read at render time, so they can be rendered only once.
- **Text is plain values:** text children are strings, numbers and bigints instead of `{ type: "textNode", text }`; the `textNode` type was removed.
- **#jsxToString can return synchronously:** it returns `string | Promise<string>` and only returns a promise once it hits async work. `await jsxToString(...)` keeps working.
- **Only real elements render:** hand-built objects like `{ type: "tag", tag: "b", props }` render nothing; use #createElement. Copies of real elements (`{ ...element, tag: "i" }`) still render.
- **Invalid component types throw:** a tag that is neither a string nor a function (e.g. `undefined` from a missing import) fails the render with a `TypeError`, like in React, instead of rendering nothing.
- **Void tags ignore children:** `<br>text</br>` renders `<br>`. Void tags are recognized in lowercase, uppercase and capitalized (`<BR />` renders `<BR>`).
- **Override scope:** a `this.jsxToString` override set by a component also applies to the siblings that follow it.
- **Exports:** renamed the `Tag` type to `ElementNode`; removed `jsxsDEV` from `jsx-async-runtime/jsx-dev-runtime` (compiled JSX uses `jsxDEV`).

### New features

- **#jsxToStream** renders to a `ReadableStream<string>`. It sends the markup rendered so far whenever rendering waits for async work, splits large pages into ~16 KB chunks, pauses while the reader is behind, and stops when the reader cancels.
- **#isJsxNode** checks whether a value is an element or #html markup (by Symbol marker, so JSON look-alikes don't count) and narrows the type in TypeScript.
- **New child types:**
  - Promises, e.g. `<div>{promise}</div>`.
  - Iterables like a `Set`, a generator or `map.values().map(...)`.
  - Async iterables like an async generator component or a `ReadableStream`. Items render in order as they arrive; on error or cancel the source is stopped (`return()`), so `finally` blocks run.
  - Bytes (`Uint8Array`, `Buffer`), rendered as escaped UTF-8 text, e.g. `<pre>{response.body}</pre>`.
  - Objects with their own `toString` (`Date`, `URL`, `Error`, your classes), rendered as escaped text. Iterables still render their items, so use e.g. `String(params)` for `URLSearchParams`.
  - Functions, passed to components as render props, e.g. `<Loader>{(data) => <p>{data}</p>}</Loader>`. Tags still render functions as nothing.
- **Promise attributes**, e.g. `<img src={loadImageUrl()} />`. All promise attributes of a tag are awaited in parallel.

### Fixes

**Async and cleanup**

- A promise passed directly to #jsxToString is awaited instead of rendering an empty string.
- Rejected promises in props (directly, in arrays or objects) or in nested arrays returned by components no longer crash Node with an unhandled rejection. The error goes to the render, or to the component when it awaits the promise.
- Streams that are never rendered (a `ReadableStream` or Node.js stream in a void tag, an invalid tag, or after a failed or cancelled render) are cancelled or destroyed, so they don't keep connections or files open.

**Attributes**

- Skipped instead of rendered as garbage: functions and symbols (event handlers no longer print their source), values without their own string form (`Map`, `Set`, plain class instances), and elements or #html markup.
- Bytes render as UTF-8 text instead of `104,105`.
- BigInts inside object or array attributes are encoded as strings instead of failing the render.
- A promise inside an object or array attribute fails with a `TypeError` instead of rendering `{}`.

**Elements and API**

- `key` is never rendered. Components don't receive it in their props when it is written in JSX or passed to #createElement; a `key` that is only spread in (e.g. `<Row {...node} />`) is passed through, so creating elements stays fast. The dev runtime no longer adds its source info as children.
- #createElement no longer modifies the props you pass in, and argument children replace `props.children` like in React (fixes `<Row {...node} key={id}>label</Row>` also rendering `node.children`).
- Array or `Set` props that contain themselves no longer overflow the stack.
- A `this.jsxToString` override that returns a non-string renders it like a child (elements as markup, `false` as nothing).
- #jsxToString and #jsxToStream called without a context, on a namespace import or through CommonJS interop give each render a new empty context. Fixes "Cannot set properties of undefined", data leaking between renders, and slower rendering with fewer stream chunks.
- #escapeEntities converts non-strings with `String()` before escaping, instead of throwing or returning them unescaped.

### Security

- Only markup created by #html is rendered raw. Objects with an `html` key (e.g. parsed JSON) render nothing, and so do non-string values passed to #html.
- Elements carry a Symbol marker, so JSON look-alikes such as `{"type":"tag","tag":"script",...}` render nothing.
- Attribute names with whitespace, quotes, `<`, `>`, `/`, `=`, `&` or control characters are skipped, and invalid tag names are skipped with their children. Valid names like `onmouseover` or `script` still render, so allowlist attributes and tags that come from untrusted input.
- Keys inherited from a polluted `Object.prototype` are ignored.

### Types (jsx.types)

- Async components with a `Promise<JSX.Element>` return type work in JSX; valid tags are described by `JSX.ElementType` (TypeScript 5.1+).
- #jsxToString and #jsxToStream accept a promise of an element.
- Children and attributes accept any thenable (`PromiseLike`); attributes accept `null`; #createElement accepts `null` props.
- `key` is accepted on every component via `JSX.IntrinsicAttributes`.
- Elements are typed as `ElementNode` (with `tag: JSX.ElementType`) and carry a type-only marker, so hand-built elements and `{ html }` objects fail type checks where elements are typed. Children of HTML and SVG tags aren't type-checked.
- Objects with their own `toString` aren't part of the child types; convert them with `String()` first.
- Built-in attribute types moved to the new `JSX.IntrinsicElementAttributes`. Add custom elements there (instead of `JSX.IntrinsicElements`) to get `null` and promise support.
- Stricter attributes: `aria-*` no longer accept booleans, and `contenteditable`, `spellcheck`, `translate` and `writingsuggestions` no longer accept `false`. Use string values like `aria-hidden="true"` or `spellcheck="false"`.
- SVG fixes: `stroke-dashadust` typo (now `stroke-dashadjust`), `foreignObject` not deprecated, `vkern` deprecated, `paint-order` accepts keyword combinations.
- The JSX types are also exported from `jsx-async-runtime/jsx-dev-runtime` (for `"jsx": "react-jsxdev"`).

## 2.3.0 - 2026-10-23

- Improved performance of attribute rendering (~1.5x faster) by avoiding intermediate arrays
- Skip empty style objects and null, undefined or false style values
- Render arrays returned by components (or passed to #jsxToString), awaiting promises inside them
- Render bigint children
- Render 0 as only child (e.g. `<h1>{0}</h1>`)
- Added edge case tests
- @types/node@26.6.5

## 2.2.1 - 2026-09-08

- Removed unnecessary checks for non-zero string length in #jsxToString
- @types/node@26.5.0

## 2.2.0 - 2026-07-12

- Replaced esbuild with typescript@7 for building, delivering unbundled code in dist
- Replaced tsx with typescript for tests and examples
- @types/node@26.1.1

## 2.1.3 - 2026-06-12

- Added `geolocation` as new HTMLElement to jsx.types
- Updated to esbuild@0.28.1, @types/node@25.9.3

## 2.1.2 - 2026-05-04

- Updated to typescript@6.0.3, @types/node@25.6.2
- Ignore CHANGELOG.md for package release

## 2.1.1 - 2026-04-04

- Updated to esbuild@0.28.0, @types/node@25.5.2

## 2.1.0 - 2026-03-24

- Updated all exports and imports to include the `.js` extension, ensuring compatibility with the TypeScript compiler
- Updated to esbuild@0.27.4, @types/node@25.5.0, typescript@6.0.2

## 2.0.3 - 2026-03-05

- Updated to esbuild@0.27.3
- Reformat core code
- Trusted publishing to npm

## 2.0.2 - 2025-12-21

- Updated to esbuild@0.27.2

## 2.0.1 - 2025-11-10

- Updated tsconfig.json (moduleResolution=bundler)
- esbuild@0.27.0

## 2.0.0 - 2025-10-12

- **Breaking change:** escape all HTML entities per default
  - Opt out of escaping with `{ html: "<b>Text</b>" }` in JSX or via global context configuration with `this.jsxEscapeHTML=false`
- Use faster & more robust `escapeHTML` from `fast-escape-html` internally and for exported utility function `escapeEntities`

## 1.0.4 - 2025-08-13

- Updated to typescript@5.9.2 => proper fix for typing error (previously suppressed with ts-expect-error)
- esbuild@0.25.9

## 1.0.3 - 2025-07-09

- Added "selectedcontent" element to jsx.types
- esbuild@0.25.6

## 1.0.2 - 2025-05-28

- esbuild@0.25.5

## 1.0.1 - 2025-05-03

- Consistent naming of internal variables
- Replaced nodemon with esbuild watcher
- esbuild@0.25.3, typescript@5.8.3

## 1.0.0 - 2025-03-15

- Added missing return types
- esbuild@0.25.1, typescript@5.8.2

## 0.8.1 - 2025-02-28

- Use interfaces instead of types for attribute & elements typings, so types can be extended in userland

## 0.8.0 - 2025-02-26

- Consistent use of types instead of interfaces
- Added typings for svg elements & attributes

## 0.7.1 - 2025-01-17

- Build class attribute from array of strings

## 0.7.0 - 2025-01-13

- Improved HTML typings
- Multiple rel attributes
- Allow numbers in object styles
- Use `(string & {})` to allow arbitrary attribute values while preserving code completions
- Removed any-types for SVG & MathML

## 0.6.2 - 2024-12-03

- Updated HTML typings with MDN
- Added deprecated tags & attributes

## 0.6.1 - 2024-12-01

- Fix(escapeEntities): don't escape existing `&amp;` sequence

## 0.6.0 - 2024-11-23

- Removed deprecated alias "renderToString"

## 0.5.2 - 2024-10-04

- Dep. updates

## 0.5.1 - 2024-09-18

- Deps updated

## 0.5.0 - 2024-07-25

- Use "this" to provide a custom jsxToString function which allows to modify/replace existing JSX components, implement helmet like head and more
- Removed Object.freeze for children / props to prepare component interception

## 0.4.2 - 2024-07-12

- Ship non-minified version

## 0.4.1 - 2024-07-11

- Fixed: rendering in Vitest results in undefined

## 0.4.0 - 2024-07-10

- Added option to bind "this" as context to avoid prop drilling

## 0.3.0 - 2024-07-05

- Deprecated unnecessary renderToString() wrapper in favor of jsxToString()

## 0.2.2 - 2024-07-01

- esbuild@0.22.0, nodemon@3.1.4, typescript@5.5.2

## 0.2.1 - 2024-04-24

- Fix: empty class object should omit rendering of class attribute

## 0.2.0 - 2024-04-22

- Change: removed indent option from renderToString
- No paddings / newlines are created anymore by renderer to improve consistency with tools like prettier

## 0.1.8 - 2024-03-23

- typescript@5.4.3

## 0.1.7 - 2024-03-15

- esbuild@0.20.2

## 0.1.6 - 2024-02-28

- `build:esm` with platform=neutral

## 0.1.5 - 2024-02-26

- nodemon@3.1.0

## 0.1.4 - 2024-01-03

- Dep. updates

## 0.1.3 - 2024-01-03

- Organize import in jsx-runtime
- Added more tests

## 0.1.2 - 2023-12-28

- Default `indent = 0`

## 0.1.1 - 2023-12-28

- Fixed bug / revert: boolean elements must be rendered as empty string, otherwise conditionals will render 'false'

## 0.1.0 - 2023-12-28

- Some performance optimizations for jsx-to-string
- Using `<>` doesn't increase indent level anymore

## 0.0.3 - 2023-12-24

- Provide utility function to escape entities

## 0.0.2 - 2023-12-23

- Removed render-error
- Cleanups & refactorings
- Updated docs

## 0.0.1 - 2023-12-22

- Initial release
