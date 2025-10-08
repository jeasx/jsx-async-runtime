# Changelog

 Version | Date       | Release Notes
 :-      | :-         | :-
 1.0.4   | 2025/08/13 | dep. update to typescript@5.9.2 => proper fix for typing error (previously surpressed with ts-expect-error). esbuild@0.25.9
 1.0.3   | 2025/07/09 | added "selectedcontent" element to jsx.types. esbuild@0.25.6
 1.0.2   | 2025/05/28 | esbuild@0.25.5
 1.0.1   | 2025/05/03 | Consistent naming of internal variables. Replaced nodemon with esbuild watcher. esbuild@0.25.3. typescript@5.8.3
 1.0.0   | 2025/03/15 | Added missing return types. esbuild@0.25.1, typescript@5.8.2
 0.8.1   | 2025/02/28 | Use interfaces instead of types for attribute & elements typings, so types can be extended in userland
 0.8.0   | 2025/02/26 |consistent use of types instead of interfaces. added typings for svg elements & attributes
 0.7.1   | 2025/01/17 | feat: build class attribute from array of strings
 0.7.0   | 2025/01/13 | Improved HTML typings. Multiple rel attributes; allow numbers in object styles. Use (string & {}) to allow arbitrary attribute values while preserving code completions. Removed any-types for SVG & MathML
 0.6.2   | 2024/12/03 | Updated HTML typings with MDN; added deprecated tags & attributes.
 0.6.1   | 2024/12/01 | fix(escapeEntities): don't escape existing &amp; sequence
 0.6.0   | 2024/11/23 | removed deprecated alias "renderToString"
 0.5.2   | 2024/10/04 | dep. updates
 0.5.1   | 2024/09/18 | deps updated
 0.5.0   | 2024/07/25 | Use "this" to provide a custom jsxToString function which allows to modify/replace existing JSX components, implement helmet like head and more. Removed Object.freeze for children / props to prepare component interception.
 0.4.2   | 2024/07/12 | Ship non-minified version
 0.4.1   | 2024/07/11 | Fixed: rendering in Vitest results in undefined
 0.4.0   | 2024/07/10 | Added option to bind "this" as context to avoid prop drilling
 0.3.0   | 2024/07/05 | deprecated unnecessary renderToString() wrapper in favor of jsxToString()
 0.2.2   | 2024/07/01 | esbuild@0.22.0, nodemon@3.1.4, typescript@5.5.2
 0.2.1   | 2024/04/24 | fix: empty class object should omit rendering of class attribute
 0.2.0   | 2024/04/22 | change: removed indent option from renderToString. No paddings / newlines are created anymore by renderer to improve consistency with tools like prettier.
 0.1.8   | 2024/03/23 | typescript@5.4.3
 0.1.7   | 2024/03/15 | esbuild@0.20.2
 0.1.6   | 2024/02/28 | build:esm with platform=neutral
 0.1.5   | 2024/02/26 | nodemon@3.1.0
 0.1.4   | 2024/01/03 | dep. updates
 0.1.3   | 2024/01/03 | Organize import in jsx-runtime;added more tests.
 0.1.2   | 2023/12/28 | default indent = 0
 0.1.1   | 2023/12/28 | Fixed bug / revert: boolean elements must be rendered as empty string, otherwise conditionals will render 'false'.
 0.1.0   | 2023/12/28 | Some performance optimizations for jsx-to-string; using <> doesn't increase indent level anymore.
 0.0.3   | 2023/12/24 | Provide utility function to escape entities.
 0.0.2   | 2023/12/23 | Removed render-error; cleanups & refactorings; updated docs
 0.0.1   | 2023/12/22 | Initial release
