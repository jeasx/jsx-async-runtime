// A small benchmark harness without dependencies.
// Each case is warmed up first, then run repeatedly for a fixed time.

const WARMUP_MS = 300;
const MEASURE_MS = 1500;
const MIN_RUNS = 20;

/**
 * Runs `fn` repeatedly and returns timing statistics in milliseconds.
 * `fn` may return a promise, which is awaited; sync results are not,
 * so sync rendering isn't slowed down by extra microtasks.
 */
export async function measure(fn) {
  await runFor(fn, WARMUP_MS, 1);
  globalThis.gc?.();
  const durations = await runFor(fn, MEASURE_MS, MIN_RUNS);
  durations.sort((a, b) => a - b);
  const total = durations.reduce((sum, d) => sum + d, 0);
  return {
    runs: durations.length,
    mean: total / durations.length,
    p50: percentile(durations, 0.5),
    p99: percentile(durations, 0.99),
    opsPerSec: (durations.length / total) * 1000,
  };
}

async function runFor(fn, ms, minRuns) {
  const durations = [];
  const end = performance.now() + ms;
  while (performance.now() < end || durations.length < minRuns) {
    const start = performance.now();
    const result = fn();
    if (typeof result?.then === "function") {
      await result;
    }
    durations.push(performance.now() - start);
  }
  return durations;
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

/**
 * Runs all cases whose name contains one of the filters (all cases without filters)
 * and prints one line per case.
 */
export async function run(cases, filters) {
  const selected = cases.filter(
    ({ name }) => filters.length === 0 || filters.some((f) => name.includes(f)),
  );
  if (selected.length === 0) {
    console.log(`No case matches: ${filters.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  const width = Math.max(...selected.map(({ name }) => name.length));
  console.log(`Node ${process.version}\n`);
  console.log(
    `${"case".padEnd(width)}  ${"ops/s".padStart(9)}  ${"mean".padStart(9)}  ${"p50".padStart(9)}  ${"p99".padStart(9)}  ${"output".padStart(8)}`,
  );
  for (const { name, fn } of selected) {
    // Render once up front, so a broken case fails before it is timed.
    const size = (await fn()).length;
    const stats = await measure(fn);
    console.log(
      `${name.padEnd(width)}  ${format(stats.opsPerSec, 0).padStart(9)}  ${ms(stats.mean)}  ${ms(stats.p50)}  ${ms(stats.p99)}  ${kb(size)}`,
    );
  }
}

function format(value, digits) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function ms(value) {
  return `${format(value, 3)}ms`.padStart(9);
}

function kb(chars) {
  return `${format(chars / 1024, 1)}KB`.padStart(8);
}
