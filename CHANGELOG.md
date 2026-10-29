# Changelog

## Unreleased

This release adds streaming and makes rendering faster, safer and more predictable:

- **Faster:** #jsxToString is about 2x faster than in 2.3.0.
- **Streaming:** The new #jsxToStream sends markup to the browser while async components are still loading.
- **Raw HTML is opt-in:** Raw markup now needs #html, the `jsxEscapeHTML` option was removed, and plain objects that only look like elements or `{ html }` render nothing. User data can no longer inject markup.
- **More child types:** Promises, iterables, async iterables (e.g. async generators or a `ReadableStream`), bytes and render props can now be used as children. Before, most of them rendered nothing.

Read the breaking changes below before upgrading.

### Breaking changes

- Raw markup must be created with the new #html function, e.g. `{html("<!DOCTYPE html>")}` instead of `{{ html: "<!DOCTYPE html>" }}`. Plain `{ html }` objects render nothing. To migrate, replace `{{ html: x }}` with `{html(x)}` and import `html` from `jsx-async-runtime`.
- Removed the `jsxEscapeHTML` context option. Setting `this.jsxEscapeHTML = false` no longer turns off escaping, so text is always escaped unless it is wrapped in #html. To migrate, wrap trusted markup in #html, e.g. `{html(cmsContent)}`. If you need raw text everywhere (e.g. a trusted HTML stream from `fetch()`, which #html can't wrap), use a `this.jsxToString` override that returns text as is.
- Text children are now plain strings, numbers and bigints instead of `{ type: "textNode", text }` objects, and the `textNode` type was removed. If you read or create text nodes (e.g. in `props.children` or a `this.jsxToString` override), use plain strings instead.
- Children of void tags (e.g. `<br>text</br>`) are ignored, so they always render as a single tag like `<br>` instead of invalid HTML like `<br>text</br>`. Void tags are recognized in lowercase, uppercase and capitalized, so `<BR />` renders `<BR>` instead of `<BR></BR>`, which browsers read as two line breaks. Other mixed case like `<bR />` isn't recognized.
- #jsxToString now returns `string | Promise<string>` instead of always returning a promise. It renders synchronously and only returns a promise once it hits an async component or a promise child. `await jsxToString(...)` keeps working unchanged.
- Components receive `children` as written, like in React and as TypeScript types them: a single child as is (e.g. a string or an element), several children as an array, and no `children` prop without children. Previously `children` was always a flattened array without `null` and boolean values, so a component typed as `({ children }: { children: string })` passed type checks, but got `["hello"]` and failed on `children.toUpperCase()`. Components that need an array can normalize it, e.g. `[children ?? []].flat()`. A `this.jsxToString` override and code reading `props.children` of an element also get the children as written, e.g. nested arrays, `null` and `false`. Generators and other iterators passed as children are now read when they are rendered instead of when the element is created, so like async iterables they can be rendered only once.
- A `this.jsxToString` override set by a component now also applies to the siblings that follow it, not only to its children.
- Only elements created by JSX, #createElement or `jsx()` are rendered. Element objects built by hand (e.g. `{ type: "tag", tag: "b", props }`) render nothing; create them with #createElement instead. Copies of real elements (e.g. `{ ...element, tag: "i" }`) still render.
- An element whose tag is neither a string nor a function (e.g. `<Card />` where `Card` is `undefined` because of a missing import or a wrong default export) now fails the render with a `TypeError`, like in React. Previously it silently rendered nothing, and streams in its children were never cancelled.
- Removed the `jsxsDEV` export from `jsx-async-runtime/jsx-dev-runtime`. It isn't part of the JSX dev runtime and no compiler calls it; compiled JSX uses `jsxDEV`, which is unchanged.

### New features

- Added #isJsxNode, which checks if a value is an element or #html markup, i.e. what the runtime renders as markup. It checks the Symbol marker, so objects that only look like elements (e.g. `{"type":"tag","props":{}}` from JSON) don't count. Use it to decide whether a result needs rendering (e.g. a route that returns either JSX or JSON data), or in a `this.jsxToString` override, where it also narrows the type in TypeScript, so `isJsxNode(element) && element.tag === "script"` type-checks.
- Added #jsxToStream, which renders to a `ReadableStream<string>`. It sends the markup rendered so far each time rendering has to wait for an async component or promise, so the browser can start displaying the page earlier. Large pages are also sent in chunks of about 16 KB, and rendering pauses while the reader is behind, even when no component is async. When the reader cancels (e.g. the client disconnects), rendering stops at the next component, also inside a `this.jsxToString` override.
- Promises can be used directly as children (e.g. `<div>{promise}</div>`). They are awaited and rendered instead of being silently dropped.
- Promises can be used as attribute values (e.g. `<img src={loadImageUrl()} />`). All promise attributes of a tag are awaited in parallel and rendered like their values, instead of rendering `src="[object Promise]"`.
- Iterables other than arrays can be used as children or returned by components, e.g. a `Set`, a generator or an iterator helper like `map.values().map((value) => <li>{value}</li>)`. Previously they silently rendered nothing.
- Async iterables can be used as children or returned by components, e.g. an async generator component (`async function* Rows() { for await (const row of cursor) yield <tr>...</tr>; }`) or a `ReadableStream`. Items are rendered in order as they arrive, and #jsxToStream sends the markup rendered so far while waiting for each item. If rendering fails or the stream is cancelled, the source is stopped (its `return()` is called, like `break` in a `for await` loop), so an async generator can close its cursor in `finally`. Previously they silently rendered nothing.
- Bytes (a `Uint8Array` or `Buffer`) are rendered as UTF-8 text and escaped like a string, e.g. a file from `readFile()` or a `fetch()` body (`<pre>{response.body}</pre>`). Previously bytes rendered nothing.
- Function children are passed to components, so render props work, e.g. `<Loader>{(data) => <p>{data}</p>}</Loader>`, where the component calls `children(data)`. Previously function children were dropped and the component got `children: []`. Tags still render functions as nothing.

### Fixes

- A promise passed directly to #jsxToString (e.g. `jsxToString(loadPage())`) is awaited and rendered instead of rendering an empty string.
- A promise passed as a prop to a component (e.g. `<UserCard user={loadUser()} />`) no longer crashes Node with an unhandled rejection when it rejects before the component renders. The component still gets the error when it awaits the promise.
- A promise inside a nested array returned by a component (e.g. `[<Slow />, ids.map(loadItem)]`) inside an array prop (e.g. `<UserList users={[loadUser(1), loadUser(2)]} />`) or directly inside an object prop (e.g. `<Profile data={{ user: loadUser(1) }} />`) no longer crashes Node with an unhandled rejection when it rejects while an earlier sibling is still rendering. The error is reported like any other render error, or to the component when it awaits the promise.
- An array or `Set` prop that contains itself (e.g. a list with a reference to itself) no longer makes creating the element fail with "Maximum call stack size exceeded". Arrays nested several times in a prop are checked for promises only once.
- `key` is no longer rendered as text or as an HTML attribute, and the dev runtime no longer adds its source info as children. Components using compiled JSX don't receive `key` in their props; with #createElement (classic runtime, or `key` placed after a spread) it is still passed through.
- A `ReadableStream` (e.g. a `fetch()` body) in the children of a void tag or of a tag with an invalid name is cancelled, since those children are never rendered. Previously it was never read or cancelled, so it could keep a connection open.
- `class` arrays may nest and contain objects, e.g. `class={["a", ["b"], { c: cond }]}` renders `class="a b c"` instead of `class="a b,[object Object]"`. `true` in a `class` array is skipped like `false`, as in clsx, so `class={[isActive || "inactive"]}` no longer adds a `true` class. The new `JSX.ClassValue` type describes all allowed values.
- Empty string style values are skipped like `null`, `undefined` and `false`, as in React, so `style={{ color: "" }}` renders no `style` attribute instead of `style="color: "`.
- Event handlers and other function or symbol attribute values (e.g. `onclick={() => ...}`) are skipped instead of printing their source code into the HTML.
- BigInt values inside object or array attributes (e.g. `data-x={{ id: 1n }}`) are encoded as strings instead of making the render fail.
- Elements and #html markup used as attribute values (e.g. `title={<b>x</b>}`) render nothing instead of their internal structure as JSON. Inside object or array attributes they are left out like functions.
- Objects with their own `toString` method used as children (e.g. `<p>{new Date()}</p>`, a `URL`, an `Error` or an instance of your own class) render their string form, escaped like text, as they already did as attribute values. Previously they silently rendered nothing. Plain objects and class instances without their own `toString` still render nothing.
- #createElement no longer modifies the props object you pass in. Reusing the same props object for several elements previously duplicated their children.
- Children passed to #createElement as arguments replace `props.children`, like in React, instead of being rendered together with them. Compiled JSX calls #createElement when `key` comes after a spread, so `<Row {...node} key={node.id}>label</Row>` rendered `label` plus `node.children`. It now renders the same as without `key`.
- `Fragment` is exported from the main entry, next to #createElement, so the classic runtime can be used with a single import (e.g. `import { createElement, Fragment } from "jsx-async-runtime"`).
- Calling #jsxToString or #jsxToStream without a context (e.g. `jsxToString(<App />)` instead of `jsxToString.call({}, <App />)`) gives each render a new empty context, so components that write to `this` no longer fail with "Cannot set properties of undefined".
- Calling #jsxToString or #jsxToStream on a namespace import (e.g. `import * as runtime from "jsx-async-runtime"` and then `runtime.jsxToString(<App />)`) gives the render a new empty context. Previously the read-only module object became `this`, so components writing to `this` failed, and its `jsxToString` export was used as an override for every nested element, which slowed rendering and made streaming send fewer, larger chunks. The same applies to the copy of the module that CommonJS interop creates (e.g. TypeScript's `esModuleInterop`), which every render would otherwise share as `this`, so data written to `this` in one render leaked into the next.
- #escapeEntities converts values that aren't strings to a string first, e.g. a number or a `URL`, and returns `""` for `null`, `undefined` and booleans, which render nothing as children too. Previously it threw a `TypeError` for values containing a special character (e.g. `escapeEntities(new URL("https://example.com/?a=1&b=2"))`) and returned other values unescaped and unchanged.
- The package can be loaded with `require()` from CommonJS (Node 22.12+), e.g. in Jest or older tooling. Previously the exports only allowed `import`, so `require("jsx-async-runtime")` failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

### Security

- Keys inherited from a polluted `Object.prototype` are ignored. If the app has a prototype pollution bug elsewhere (e.g. a naive deep merge of a request body like `{"__proto__":{"onmouseover":"alert(1)"}}`), the polluted keys are no longer rendered as attributes on every tag (or in `style` and `class` objects), and a polluted `html` key no longer turns every element into raw markup.
- Only markup created by #html is rendered raw. Plain objects with an `html` key, e.g. parsed JSON like `{"html":"<img src=x onerror=...>"}` from a request body or a database record, render nothing instead of outputting their `html` value unescaped, so user data passed as a child (e.g. `<p>{comment.text}</p>`) can't inject markup. Values passed to #html that aren't strings (e.g. `null`, `undefined`, numbers, arrays or objects) render nothing instead of their string form.
- Attribute names containing whitespace, quotes, `<`, `>`, `/`, `=`, `&` or control characters are skipped, so object keys from untrusted input can't break out of the tag and inject markup. Valid names are still rendered, so spreading untrusted data onto an element can still add event handlers like `onmouseover`; pass only the attributes you expect.
- Invalid tag names (not starting with an ASCII letter, or containing the characters above) are skipped together with their children, so dynamic tags from untrusted input (e.g. `createElement(props.as)`) can't inject markup. Valid tags like `script` are still rendered, so allow only known tags for dynamic tag names.
- Objects that only look like elements, e.g. parsed JSON like `{"type":"tag","tag":"script","props":{...}}` from a request body, render nothing. Elements are marked with a Symbol, which JSON can't contain, so user data passed as a child (e.g. `<p>{comment.text}</p>`) can't inject tags or attributes.

### Types (jsx.types)

- Components with a `Promise<JSX.Element>` return type (e.g. `async function Page(): Promise<JSX.Element>`) can be used in JSX. Previously only async components without a return type passed type checks. Valid tags are now described by `JSX.ElementType` (TypeScript 5.1+).
- #jsxToString and #jsxToStream accept a promise of an element (e.g. `jsxToString(loadPage())`), matching what the runtime renders.
- Attributes accept `null` (also as a promise value), which renders nothing like `undefined`, so `<div id={null} />` no longer fails type checks with `strict` enabled.
- #createElement accepts `null` as props, like in React, so `createElement(Fragment, null, a, b)` no longer fails type checks with `strict` enabled.
- `Tag.tag` is typed as `string | ((props) => JSX.Element)`, matching what the runtime actually passes.
- `key` is accepted on components (e.g. `<Item key={id} label={label} />`) via `JSX.IntrinsicAttributes`, instead of failing type checks when the component's props don't declare it.
- `Tag` and raw markup carry a type-only marker, so TypeScript rejects hand-built element objects and plain `{ html }` objects (e.g. returned by a component), matching what the runtime renders. Create them with #createElement and #html instead.
- `class` accepts falsy values, matching what the runtime already skips: arrays may contain `false`, `null` and `undefined` (e.g. `class={["a", cond && "b"]}`), and object values may be `null` or `undefined` (e.g. `class={{ active: user?.isActive }}`).
- `aria-*` attributes only accept strings. Booleans didn't work as expected: `true` renders an empty attribute (which ARIA treats as unset) and `false` removes it. Use e.g. `aria-hidden="true"`.
- `contenteditable`, `spellcheck`, `translate` and `writingsuggestions` no longer accept `false`, because it removes the attribute (so the parent's value applies) instead of turning the feature off. Use the string value instead (e.g. `spellcheck="false"` or `translate="no"`).
- Fixed the `stroke-dashadust` typo (now `stroke-dashadjust`), `foreignObject` is no longer marked as deprecated, `vkern` is marked as deprecated, and `paint-order` accepts keyword combinations (e.g. `"stroke fill"`).
- The JSX types are also exported from `jsx-async-runtime/jsx-dev-runtime`, so TypeScript projects using `"jsx": "react-jsxdev"` no longer fail with "Cannot find namespace 'JSX'".

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
