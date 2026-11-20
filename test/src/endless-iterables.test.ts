import { spawnSync } from "node:child_process";
import { strict as assert } from "node:assert";
import { dirname } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// An endless iterable whose items render nothing (e.g. "" or `null`) never grows the buffer, so the
// render never flushes and never awaits a macrotask: it misses the cancel checks and spins forever,
// blocking the event loop. Even with text items, the render and a fast reader ping-pong in
// microtasks only, so the reader's cancel timer never fires.
//
// The renders run in child processes, so a hang fails the test fast (the child is killed after
// the timeout) instead of hanging the test runner.

const dir = dirname(fileURLToPath(import.meta.url));

function checkCancellable(name: string, generator: string): void {
  test(name, () => {
    const script = `
      import { createElement, jsxToStream } from "jsx-async-runtime";
      ${generator}
      const reader = jsxToStream.call({}, createElement("p", null, endless())).getReader();
      setTimeout(async () => {
        await reader.cancel(new Error("reader is done"));
        console.log("cancelled");
      }, 50);
      for (;;) {
        const { done } = await reader.read();
        if (done) break;
      }
      console.log("stream closed");
    `;
    const result = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
      cwd: dir,
      timeout: 5000,
      encoding: "utf8",
    });
    const output = `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`;
    // A hang ends as signal "SIGTERM" with a null exit code, once the timeout killed the child.
    assert.strictEqual(result.signal, null, `render hung and the child was killed:\n${output}`);
    assert.strictEqual(result.status, 0, `child failed:\n${output}`);
    // The cancel got through, the reader saw the stream end, and the render stopped the source.
    for (const line of ["cancelled", "stream closed", "stopped"]) {
      assert.match(result.stdout, new RegExp(`^${line}$`, "m"), `missing "${line}":\n${output}`);
    }
  });
}

const endless = (prefix: string, item: string) => `
  ${prefix}function* endless() {
    try {
      for (;;) yield ${item};
    } finally {
      console.log("stopped");
    }
  }
`;

checkCancellable(
  "stream cancel stops an endless sync iterable whose items render nothing",
  endless("", "null"),
);

checkCancellable(
  "stream cancel stops an endless sync iterable with text items",
  endless("", '"x"'),
);

checkCancellable(
  "stream cancel stops an endless async iterable whose items render nothing",
  endless("async ", "null"),
);
