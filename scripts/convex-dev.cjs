#!/usr/bin/env node
/**
 * scripts/convex-dev.cjs
 *
 * Wrapper for `npx convex dev` so the root project can run
 * `pnpm run convex:dev` and share environment configuration.
 */

const { spawn } = require("node:child_process");

const child = spawn("npx", ["convex", "dev"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
