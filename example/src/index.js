import { renderToString } from "jsx-async-runtime";
import { createServer } from "node:http";
import App from "./App";

createServer(async (request, response) => {
  const markup = await renderToString(App({ url: request.url }));
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(markup);
}).listen(3000);

console.log(
  "\n🚀 Server is running at <http://localhost:3000/>\nUse 'CTRL+C' to stop the server...",
);
