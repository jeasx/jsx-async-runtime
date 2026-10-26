# Changelog

## Unreleased

### Breaking changes

- #jsxToString now returns `string | Promise<string>` instead of always returning a promise. It renders synchronously and only returns a promise once it hits an async component or a promise child. `await jsxToString(...)` keeps working unchanged
- Text children are now plain strings, numbers and bigints instead of `{ type: "textNode", text }` objects, and the `textNode` type was removed. If you read or create text nodes (e.g. in `props.children` or a `this.jsxToString` override), use plain strings instead
- A `this.jsxToString` override set by a component now also applies to the siblings that follow it, not only to its children

### New features

- Added #jsxToStream, which renders to a `ReadableStream<string>`. It sends the markup rendered so far each time rendering has to wait for an async component or promise, so the browser can start displaying the page earlier
- Promises can be used directly as children (e.g. `<div>{promise}</div>`). They are awaited and rendered instead of being silently dropped

### Fixes

- `key` is no longer rendered as text or as an HTML attribute, and the dev runtime no longer adds its source info as children. Components using compiled JSX don't receive `key` in their props; with #createElement (classic runtime, or `key` placed after a spread) it is still passed through
- Event handlers and other function or symbol attribute values (e.g. `onclick={() => ...}`) are skipped instead of printing their source code into the HTML
- Objects like `URL` or `Date` used as attribute values (e.g. `href={new URL(...)}`) render as their string value, e.g. `href="https://..."`, instead of quoted JSON. Plain objects and arrays are still JSON-encoded
- BigInt values inside object or array attributes (e.g. `data-x={{ id: 1n }}`) are encoded as strings instead of making the render fail
- #createElement no longer modifies the props object you pass in. Reusing the same props object for several elements previously duplicated their children

### Security

- Attribute names containing whitespace, quotes, `<`, `>`, `/`, `=`, `&` or control characters are skipped, so object keys from untrusted input can't inject attributes or markup
- Invalid tag names (not starting with an ASCII letter, or containing the characters above) are skipped together with their children, so dynamic tags from untrusted input (e.g. `createElement(props.as)`) can't inject markup

### Types (jsx.types)

- `Tag.tag` is typed as `string | ((props) => JSX.Element)`, matching what the runtime actually passes
- `aria-*` attributes only accept strings. Booleans didn't work as expected: `true` renders an empty attribute (which ARIA treats as unset) and `false` removes it. Use e.g. `aria-hidden="true"`
- `contenteditable`, `spellcheck`, `translate` and `writingsuggestions` no longer accept `false`, because it removes the attribute (so the parent's value applies) instead of turning the feature off. Use the string value instead (e.g. `spellcheck="false"` or `translate="no"`)
- Fixed the `stroke-dashadust` typo (now `stroke-dashadjust`), `foreignObject` is no longer marked as deprecated, `vkern` is marked as deprecated, and `paint-order` accepts keyword combinations (e.g. `"stroke fill"`)

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
