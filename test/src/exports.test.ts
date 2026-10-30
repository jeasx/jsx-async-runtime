import * as main from "jsx-async-runtime";
import * as jsxDevRuntime from "jsx-async-runtime/jsx-dev-runtime";
import * as jsxRuntime from "jsx-async-runtime/jsx-runtime";
import { strict as assert } from "node:assert";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

test("every entry can be loaded with require()", () => {
  // e.g. from CommonJS tooling like Jest. It gets the same module as `import`.
  assert.strictEqual(require("jsx-async-runtime").jsxToString, main.jsxToString);
  assert.strictEqual(require("jsx-async-runtime/jsx-runtime").jsx, jsxRuntime.jsx);
  assert.strictEqual(require("jsx-async-runtime/jsx-dev-runtime").jsxDEV, jsxDevRuntime.jsxDEV);
  assert.strictEqual(require("jsx-async-runtime/package.json").name, "jsx-async-runtime");
});
