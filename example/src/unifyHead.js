/**
 * Unifies title and meta tags (keywords and description).
 *
 * @param {JSX.Element[]} jsxElements
 */
export default function unifyHead(jsxElements) {
  const lastIndex = {};
  for (let i = 0; i < jsxElements.length; i++) {
    const jsxElement = jsxElements[i];
    switch (jsxElement?.["tag"]) {
      case "title":
        if (lastIndex["title"]) {
          delete jsxElements[lastIndex["title"]];
        }
        lastIndex["title"] = i;
        break;

      case "meta":
        switch (jsxElement?.["props"]?.["name"]) {
          case "keywords":
          case "description":
            const name = jsxElement["props"]["name"];
            if (lastIndex[name]) {
              delete jsxElements[lastIndex[name]];
            }
            lastIndex[name] = i;
            break;
        }
        break;
    }
  }
  return jsxElements;
}
