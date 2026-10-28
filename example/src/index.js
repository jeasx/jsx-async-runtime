import { jsxToString } from "jsx-async-runtime";
import { createServer } from "node:http";
import App from "./App.js";
import unifyHead from "./unifyHead.js";

const HEAD_MARK = "[[HEAD]]";

createServer(async (request, response) => {
  const headGroups = [];

  const context = {
    jsxToString: (jsxElement) => {
      if (jsxElement?.tag === "head") {
        headGroups.push(jsxElement.props.children);
        return headGroups.length === 1 ? HEAD_MARK : "";
      }
      return jsxToString.call(context, jsxElement);
    },
  };

  try {
    const htmlDocument = await jsxToString.call(context, <App url={request.url} />);
    // Children are passed as written (a single child or a nested array), so flatten them completely.
    const htmlHead = await jsxToString.call(
      context,
      <head>{unifyHead(headGroups.flat(Infinity))}</head>,
    );
    // A function as replacement, so `$&` or `$'` in the head are inserted as written.
    const htmlPayload = htmlDocument.replace(HEAD_MARK, () => htmlHead);

    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(htmlPayload);
  } catch (error) {
    // A component threw (e.g. a failed fetch). Without this, the rejection would crash the server.
    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
}).listen(3000);

console.log(
  "\n🚀 Server is running at <http://localhost:3000/>\nUse 'CTRL+C' to stop the server...",
);
