import { isJsxNode } from "jsx-async-runtime";

/**
 * Unifies title and meta tags (keywords and description).
 *
 * @param {JSX.Element[]} jsxElements
 */
export default function unifyHead(jsxElements) {
  // Index of the last element seen per key. Index 0 is valid, so check for `undefined`.
  const lastIndex = {};
  for (let i = 0; i < jsxElements.length; i++) {
    const jsxElement = jsxElements[i];
    // Text, html() markup and look-alike objects have no tag to unify.
    if (!isJsxNode(jsxElement)) {
      continue;
    }
    switch (jsxElement.tag) {
      case "title":
        if (lastIndex["title"] !== undefined) {
          delete jsxElements[lastIndex["title"]];
        }
        lastIndex["title"] = i;
        break;

      case "meta":
        switch (jsxElement.props["name"]) {
          case "keywords":
          case "description": {
            const name = jsxElement.props["name"];
            if (lastIndex[name] !== undefined) {
              delete jsxElements[lastIndex[name]];
            }
            lastIndex[name] = i;
            break;
          }
        }
        break;
    }
  }
  return jsxElements;
}
