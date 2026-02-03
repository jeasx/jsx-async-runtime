import { jsxToString } from "jsx-async-runtime";
import { createServer } from "node:http";
import App from "./App";
import unifyHead from "./utils/unifyHead";

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

  const htmlDocument = await jsxToString.call(context, <App url={request.url} />);
  const htmlHead = await jsxToString.call(context, <head>{unifyHead(headGroups.flat())}</head>);
  const htmlPayload = htmlDocument.replace(HEAD_MARK, htmlHead);

  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(htmlPayload);
}).listen(3000);

console.log(
  "\n🚀 Server is running at <http://localhost:3000/>\nUse 'CTRL+C' to stop the server...",
);
